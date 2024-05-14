export const getCompanies = async () => {
    try{
        const response = await fetch("https://fake-api.tractian.com/companies");
        return response.json();
    }catch(e){
        alert("Erro ao buscar companhias")
    }
}

export const getCompanyLocations = async (companyId) => {
    try {
        const response = await fetch(`https://fake-api.tractian.com/companies/${companyId}/locations`)        
        return response.json();
    } catch (e) {
        alert("Erro ao buscar localizações")
    }
}

export const getCompanyAssets = async (companyId) => {
    try {
        const response = await fetch(`https://fake-api.tractian.com/companies/${companyId}/assets`)        
        return response.json();
    } catch (e) {
        alert("Erro ao buscar assets")
    }
}