const URL = 'http://127.0.0.1:8080/';
export async function getLanguagesData() {
    const response = await fetch(URL + "getLanguages");
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
export async function getProjectsData() {
    const response = await fetch(URL + "getProjects");
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}
