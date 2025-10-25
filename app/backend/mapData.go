package main

import (
	"database/sql"
	"encoding/json"
	"sort"
)
type LanguageData struct {
	Name string `json:"name"`
	Time uint64 `json:"time"`
}

type ProjectData struct {
	Name string `json:"name"`
	Time uint64 `json:"time"`
	Languages map[string]uint64 `json:"languages"`
}

type MappedData struct {
    Projects  map[string]ProjectData
    Languages map[string]LanguageData
	TotalTime uint64
}

func NewMappedData() *MappedData {
	return &MappedData{
		//use maps for faster lookup during mapping
		Projects:  make(map[string]ProjectData),
		Languages: make(map[string]LanguageData),
		TotalTime: 0,
	}
}

// MarshalJSON implements json.Marshaler and returns the mapped data in a format where maps are converted to slices for cleaner JSON.
func (m *MappedData) MarshalJSON() ([]byte, error) {
	type Alias MappedData

	projects := make([]ProjectData, 0, len(m.Projects))
	for _, v := range m.Projects {
		projects = append(projects, v)
	}
	sort.Slice(projects, func(i int, j int) bool{
		return projects[i].Time > projects[j].Time
	})

	languages := make([]LanguageData, 0, len(m.Languages))
	for _, v := range m.Languages {
		languages = append(languages, v)
	}
	sort.Slice(languages, func(i int, j int) bool{
		return languages[i].Time > languages[j].Time
	})

	return json.Marshal(&struct{
		Projects []ProjectData
		Languages []LanguageData
		TotalTime uint64
	}{
			Projects:  projects,
			Languages: languages,
			TotalTime: m.TotalTime,
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
		if p.Languages == nil{
			p.Languages = make(map[string]uint64)
		}

		if l.Name == ""{
			l.Name = languageName
		}
		p.Time += deltaTime
		p.Languages[l.Name] += deltaTime
		l.Time += deltaTime
		totalTime += deltaTime

		mappedData.Projects[projectName] = p
		mappedData.Languages[languageName] = l
	}
	mappedData.TotalTime = totalTime

	//check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return mappedData, nil
}

