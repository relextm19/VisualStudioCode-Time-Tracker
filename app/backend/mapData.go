package main
import(
	"encoding/json"
	"database/sql"
)
type Data struct {
	Name string `json:"name"`
	Time uint64 `json:"time"`
}

type MappedData struct {
	Projects  map[string]Data `json:"projects"`
	Languages map[string]Data `json:"languages"`
}

func NewMappedData() *MappedData {
	return &MappedData{
		Projects:  make(map[string]Data),
		Languages: make(map[string]Data),
	}
}

// MarshalJSON implements json.Marshaler and returns the mapped data in a format where maps are converted to slices for cleaner JSON.
func (m *MappedData) MarshalJSON() ([]byte, error) {
	type Alias MappedData // unikamy rekurencji

	projects := make([]Data, 0, len(m.Projects))
	for _, v := range m.Projects {
		projects = append(projects, v)
	}

	languages := make([]Data, 0, len(m.Languages))
	for _, v := range m.Languages {
		languages = append(languages, v)
	}

	return json.Marshal(&struct {
		Projects  []Data `json:"projects"`
		Languages []Data `json:"languages"`
	}{
		Projects:  projects,
		Languages: languages,
	})
}

func mapData(db *sql.DB, userID string) (*MappedData, error) { //here we collect the time based on languages/projects
	rows, err := db.Query("SELECT language, project, endTime - startTime FROM Sessions WHERE userID = ? AND endTime NOT NULL", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	mappedData := NewMappedData()

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

		mappedData.Projects[projectName] = p
		mappedData.Languages[languageName] = l
	}

	//check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return mappedData, nil
}

