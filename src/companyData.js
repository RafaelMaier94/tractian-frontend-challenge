class CompanyData {
  locations;
  assets;
  filteredLocations;
  filteredAssets;
  activeFilters = {
    "energy-sensor-filter": false,
    "critical-filter": false,
    textSearch: "",
  };
  constructor() {}
  selectFilterStrategy() {
    if (
      this.activeFilters["textSearch"] &&
      (this.activeFilters["critical-filter"] ||
        this.activeFilters["energy-sensor-filter"])
    ) {
      return this.filterByTextAndComponent();
    }
    if (
      !this.activeFilters["textSearch"] &&
      (this.activeFilters["critical-filter"] ||
        this.activeFilters["energy-sensor-filter"])
    ) {

      return this.filterByComponent();
    }
    if (
      this.activeFilters["textSearch"] &&
      !this.activeFilters["critical-filter"] &&
      !this.activeFilters["energy-sensor-filter"]
    ) {

      return this.filterByText();
    }
  }
  filterByTextAndComponent() {
    const filteredComponents = this.getFilteredAssets();
    if (!this.assets || !this.locations) return;
    const assetsAndLocations = [...this.assets, ...this.locations];
    const asMap = new Map();

    assetsAndLocations.forEach((asset) => asMap.set(asset.id, asset));
    const text = this.activeFilters["textSearch"];
    const filteredLocationsByText = new Map()
    const filteredLocationsByTextAndComponent = new Map()
    this.locations.forEach(el => {
      filteredLocationsByText.set(el.id, el)
    })
    const filteredAssets = new Map()
    const assetsFilteredByText = new Map()
    filteredComponents.forEach(el => {
      filteredAssets.set(el.id, el)
    })
    this.assets.forEach(el => {
      if(el.name.toLowerCase().includes(text.toLowerCase())) {
        assetsFilteredByText.set(el.id, el)
      }
    })

    const addParents = (asset) => {
      if (!asset) return;
      if (!asset.parentId && !asset.locationId && !filteredLocationsByTextAndComponent.has(asset.id)) {
        filteredLocationsByTextAndComponent.set(asset.id, asset)
      }
      const parent = 
      assetsFilteredByText.get(asset.parentId) ?? 
      assetsFilteredByText.get(asset.locationId) ??
      filteredLocationsByText.get(asset.parentId) ??
      filteredLocationsByText.get(asset.locationId)
      if(!parent ) return
      if(filteredAssets.has(parent.id)) return;
      filteredAssets.set(parent.id, parent)
    };
    filteredAssets.forEach(addParents);
    this.filteredLocations = filteredLocationsByTextAndComponent;
    this.filteredAssets = filteredAssets;
    return {
      filteredLocations: this.filteredLocations,
      filteredAssets: this.filteredAssets,
    };
  }
  getFilteredAssets() {
    if (
      this.activeFilters["energy-sensor-filter"] &&
      this.activeFilters["critical-filter"]
    )
      return this.assets.filter(
        (el) => el.sensorType === "energy" && el.status === "alert"&& el.type === "component"
      );
    if (this.activeFilters["energy-sensor-filter"]) {
      return this.assets.filter((el) => el.sensorType === "energy" &&el.type === "component");
    }
    return this.assets.filter((el) => el.status === "alert" &&el.type === "component");
  }
  filterByComponent() {
    if (!this.assets || !this.locations) return;

    const filteredComponents = this.getFilteredAssets();
    const filteredAssets = new Map();
    const filteredLocations = new Map();
    const asMap = new Map();

    filteredComponents.forEach((component) =>{
      filteredAssets.set(component.id, component)
      }
    );
    [...this.locations, ...this.assets].forEach((asset) => {
      asMap.set(asset.id, asset);
    });
    const addParents = (asset) => {
      if (!asset) return;
      if (
        !asset.parentId &&
        !asset.locationId &&
        !filteredLocations.has(asset.id)
      ) {
        filteredLocations.set(asset.id, asset);
        return;
      }

      const parent = asMap.get(asset.parentId) ?? asMap.get(asset.locationId);
      if (!parent || filteredAssets.has(parent.id)) return;
      filteredAssets.set(parent.id, parent);
      addParents(parent);
    };
    filteredComponents.forEach(addParents);
    this.filteredLocations = filteredLocations;
    this.filteredAssets = filteredAssets;
    return { filteredLocations, filteredAssets };
  }
  filterByText() {
    if (!this.assets || !this.locations) return;
    const assetsAndLocations = [...this.assets, ...this.locations];
    const asMap = new Map();

    assetsAndLocations.forEach((asset) => asMap.set(asset.id, asset));
    const filteredLocations = new Map();
    const text = this.activeFilters["textSearch"];
    this.locations.forEach((el) => {
      if (el.name.toLowerCase().includes(text.toLowerCase()))
        filteredLocations.set(el.id, el);
    });
    const filteredAssets = new Map();
    this.assets.forEach((el) => {
      if (el.name.toLowerCase().includes(text.toLowerCase()))
        filteredAssets.set(el.id, el);
    });
    const addParents = (asset) => {
      if (!asset) return;
      if (
        !asset.parentId &&
        !asset.locationId &&
        !filteredLocations.has(asset.id)
      ) {
        filteredLocations.set(asset.id, asset);
        return;
      }
      const parent = asMap.get(asset.parentId) ?? asMap.get(asset.locationId);
      if (!parent || filteredAssets.has(parent.id)) return;
      filteredAssets.set(parent.id, parent);
      addParents(parent);
    };
    filteredAssets.forEach(addParents);
    this.filteredLocations = filteredLocations;
    this.filteredAssets = filteredAssets;

    return { filteredLocations, filteredAssets };
  }
  filterBySensorOrCritical() {
    if (!this.assets || !this.locations) return;
    const getEligibleParents = () => {
      if (this.activeFilters.textSearch)
        return [
          ...this.filteredLocations.values(),
          ...this.filteredAssets.values(),
        ];
      return [...this.locations, ...this.assets];
    };

    const filteredComponents = this.getFilteredAssets();
    const filteredAssets = new Map();
    const filteredLocations = new Map();
    const asMap = new Map();

    filteredComponents.forEach((component) =>
      filteredAssets.set(component.id, component)
    );
    getEligibleParents().forEach((asset) => {
      asMap.set(asset.id, asset);
    });

    const addParents = (asset) => {
      if (!asset) return;
      if (
        !asset.parentId &&
        !asset.locationId &&
        !filteredLocations.has(asset.id)
      ) {
        filteredLocations.set(asset.id, asset);
        return;
      }
      const parent = asMap.get(asset.parentId) ?? asMap.get(asset.locationId);
      if (!parent || filteredAssets.has(parent.id)) return;
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
