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
    const assetsAndLocations = [...this.assets, ...this.locations];

    const getFilteredAssets = () => {
      if (
        this.activeFilters["energy-sensor-filter"] &&
        this.activeFilters["critical-filter"]
      )
        return assetsAndLocations.filter(
          (el) => el.sensorType === "energy" && el.status === "alert"
        );
      if (this.activeFilters["energy-sensor-filter"]) {
        return assetsAndLocations.filter((el) => el.sensorType === "energy");
      }
      return assetsAndLocations.filter((el) => el.status === "alert");
    };

    const filteredComponents = getFilteredAssets();
    const filteredAssets = new Map();
    const filteredLocations = new Map();
    const asMap = new Map();

    filteredComponents.forEach((component) =>
      filteredAssets.set(component.id, component)
    );
    assetsAndLocations.forEach((asset) => asMap.set(asset.id, asset));

    const addParents = (asset) => {
      if (!asset) return;
      if (!asset.parentId && !asset.locationId) {
        filteredLocations.set(asset.id, asset);
        return;
      }
      const parent = asMap.get(asset.parentId) ?? asMap.get(asset.locationId);
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
    //   const filteredComponents = getFilteredAssets();
    //   const filteredAssets = new Map();
    //   const filteredLocations = new Map();
      const asMap = new Map();
  
    //   filteredComponents.forEach((component) =>
    //     filteredAssets.set(component.id, component)
    //   );
      assetsAndLocations.forEach((asset) => asMap.set(asset.id, asset));
      const filteredLocations = locations.filter(el => el.name.toLowerCase().includes(text.toLowerCase()))
      const filteredAssets = assets.filter(el => el.name.toLowerCase().includes(text.toLowerCase()))

      const addParents = (asset) => {
        if (!asset) return;
        if (!asset.parentId && !asset.locationId) {
          filteredLocations.push(asset)
          return;
        }
        const parent = asMap.get(asset.parentId) ?? asMap.get(asset.locationId);
        filteredAssets.push(parent)
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
