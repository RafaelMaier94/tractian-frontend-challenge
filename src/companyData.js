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
    console.log(this.activeFilters);
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
        console.log("In energy");
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
