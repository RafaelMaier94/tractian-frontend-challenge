export const getCompanies = async () => {
    try{

        const response = await fetch("https://fake-api.tractian.com/companies");
        return response.json();
    }catch(e){
        alert("Erro ao buscar dados na API")
    }
}