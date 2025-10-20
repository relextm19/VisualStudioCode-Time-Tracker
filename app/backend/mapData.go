package main

import (
	"database/sql"
	"encoding/json"
	"sort"
)
type Data struct {
	Name string `json:"name"`
	Time uint64 `json:"time"`
}

type MappedData struct {
	Projects  map[string]Data `json:"projects"`
	Languages map[string]Data `json:"languages"`
	totalTime uint64
}

func NewMappedData() *MappedData {
	return &MappedData{
		Projects:  make(map[string]Data),
		Languages: make(map[string]Data),
	}
}

// MarshalJSON implements json.Marshaler and returns the mapped data in a format where maps are converted to slices for cleaner JSON.
func (m *MappedData) MarshalJSON() ([]byte, error) {
	type Alias MappedData // we need to define an alias to avoid inifite recursion

	projects := make([]Data, 0, len(m.Projects))
	for _, v := range m.Projects {
		projects = append(projects, v)
	}
	sort.Slice(projects, func(i int, j int) bool{
		return projects[i].Time > projects[j].Time
	})

	languages := make([]Data, 0, len(m.Languages))
	for _, v := range m.Languages {
		languages = append(languages, v)
	}
	sort.Slice(languages, func(i int, j int) bool{
		return languages[i].Time > languages[j].Time
	})

	return json.Marshal(&struct {
		Projects  []Data `json:"projects"`
		Languages []Data `json:"languages"`
		TotalTime uint64 `json:"totalTime"`
	}{
		Projects:  projects,
		Languages: languages,
		TotalTime: m.totalTime,
	})
}

func mapData(db *sql.DB, userID string) (*MappedData, error) { 
	rows, err := db.Query("SELECT language, project, endTime - startTime FROM Sessions WHERE userID = ? AND endTime NOT NULL", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	mappedData := NewMappedData()
	var totalTime uint64 = 0 

	for rows.Next() {
		var deltaTime uint64
		var languageName, projectName string

		if err := rows.Scan(&languageName, &projectName, &deltaTime); err != nil {
			return nil, err
		}

		p, l := mappedData.Projects[projectName], mappedData.Languages[languageName]
		if p.Name == ""{
			p.Name = projectName
		}
		
		if l.Name == ""{
			l.Name = languageName
		}
		p.Time += deltaTime
		l.Time += deltaTime
		totalTime += deltaTime

		mappedData.Projects[projectName] = p
		mappedData.Languages[languageName] = l
	}
	mappedData.totalTime = totalTime

	//check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return mappedData, nil
}

