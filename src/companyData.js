class CompanyData {
  locations;
  assets;
  filteredLocations;
  filteredAssets;
  activeFilters = {
    "energy-sensor-filter": false,
    "critical-filter": false,
    textSearch: false,
  };
  constructor() {
  }
  filterBySensorOrCritical() {
    if (!this.assets || !this.locations) return;
    const getEligibleParents = () => {
      if (this.activeFilters.textSearch) return [...this.filteredLocations, ...this.filteredAssets];
      return [...this.locations, ...this.assets];
    }

    const getFilteredAssets = () => {
      if (
        this.activeFilters["energy-sensor-filter"] &&
        this.activeFilters["critical-filter"]
      )
        return this.assets.filter(
          (el) => el.sensorType === "energy" && el.status === "alert"
        );
      if (this.activeFilters["energy-sensor-filter"]) {
        return this.assets.filter((el) => el.sensorType === "energy");
      }
      return this.assets.filter((el) => el.status === "alert");
    };

    const filteredComponents = getFilteredAssets();
    const filteredAssets = new Map();
    const filteredLocations = new Map();
    const asMap = new Map();

    filteredComponents.forEach((component) =>
      filteredAssets.set(component.id, component)
    );
    getEligibleParents().forEach((asset) => asMap.set(asset.id, asset));
    if(this.activeFilters.textSearch){
      this.filteredLocations.forEach(location => {
        filteredLocations.set(location.id, location)
      })
      this.filteredAssets.forEach(asset => {
        filteredAssets.set(asset.id, asset)
      })
    }

    const addParents = (asset) => {
      if (!asset) return;
      if (!asset.parentId && !asset.locationId && !filteredLocations.has(asset.id)) {
        filteredLocations.set(asset.id, asset);
        return;
      }
      const parent = asMap.get(asset.parentId) ?? asMap.get(asset.locationId);
      if(!parent || filteredAssets.has(parent.id)) return;
      filteredAssets.set(parent.id, parent);
      addParents(parent);
    };
    filteredComponents.forEach(addParents);

    this.filteredLocations = filteredLocations;
    this.filteredAssets = filteredAssets;
    return { filteredLocations, filteredAssets };
  }
  filterByText(text){
    const getTargets = () => {
        if (
          this.activeFilters["energy-sensor-filter"] ||
          this.activeFilters["critical-filter"]
        )
          return {
            locations: this.filteredLocations,
            assets: this.filteredAssets,
          };
        return { locations: this.locations, assets: this.assets };
      };
      
      if (!this.assets || !this.locations) return;
      const assetsAndLocations = [...this.assets, ...this.locations];
      const { locations, assets} = getTargets()
      const asMap = new Map();
  
      assetsAndLocations.forEach((asset) => asMap.set(asset.id, asset));
      const filteredLocations = new Map()
      locations.forEach(el => {
        if(el.name.toLowerCase().includes(text.toLowerCase())) filteredLocations.set(el.id, el)
      })
      const filteredAssets = new Map()
      assets.forEach(el => {
        if(el.name.toLowerCase().includes(text.toLowerCase())) filteredAssets.set(el.id, el)
      })
      const addParents = (asset) => {
        if (!asset) return;
        if (!asset.parentId && !asset.locationId && !filteredLocations.has(asset.id)) {
          filteredLocations.set(asset.id, asset)
          return;
        }
        const parent = asMap.get(asset.parentId) ?? asMap.get(asset.locationId)
        if(!parent || filteredAssets.has(parent.id)) return
        filteredAssets.set(parent.id, parent)
        addParents(parent);
      };
      filteredAssets.forEach(addParents);
      this.filteredLocations = filteredLocations;
      this.filteredAssets = filteredAssets;

      return { filteredLocations, filteredAssets };
  }
  get noFiltersActive() {
    return (
      !this.activeFilters["energy-sensor-filter"] &&
      !this.activeFilters["critical-filter"] &&
      !this.activeFilters.textSearch
    );
  }
}
const companyData = new CompanyData();
export default companyData;
