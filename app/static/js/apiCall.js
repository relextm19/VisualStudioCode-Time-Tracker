const URL = 'http://127.0.0.1:8080/';
export async function getLanguagesData() {
    const response = await fetch(URL + "getLanguages");
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched data:', data);
    return data;
}