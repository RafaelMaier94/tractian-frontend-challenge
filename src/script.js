import { getCompanies, getCompanyAssets, getCompanyLocations } from "./api.js";
import companyData from "./companyData.js";
import { addTypesToAssets, dataTypeSVGMapper } from "./dataTypeMapper.js";
import {
  arrowSVG,
  boltSVG,
  companiesSVG,
  componentSVG,
  locationsSVG,
} from "./svgMappers.js";

document.addEventListener("DOMContentLoaded", function () {
  addListeners();
  const innerWidth = window.innerWidth;

  if (innerWidth <= 768) {
    const assetsContainer = document.getElementById("assets-container");
    assetsContainer.classList.remove("open");
    assetsContainer.classList.add("closed");
  }
});
loadCompanies();

function createElementFromHTML(htmlString) {
  let div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

async function loadCompanies() {
  const companies = await getCompanies();
  const companiesContainer = document.getElementById("companies-container");
  companies.forEach(({ name, id }) => {
    const button = document.createElement("button");
    button.className = "unit";
    button.id = id;

    const text = document.createElement("span");
    text.id = `${id}-name`;
    text.innerText = `${name} Unit`;

    button.appendChild(createElementFromHTML(companiesSVG));
    button.appendChild(text);
    companiesContainer.appendChild(button);
  });
  const unitButtons = document.getElementsByClassName("unit");
  Array.from(unitButtons).forEach((button) => {
    button.addEventListener("click", handleClickUnitButton);
  });
}

loadLocations();

async function loadLocations() {
  const locations = await getCompanyLocations("662fd0ee639069143a8fc387");
}
function addListeners() {
  const innerWidth = window.innerWidth;
  if (innerWidth <= 768) {
    const sections = document.getElementsByClassName("content-container");
    Array.from(sections).forEach((section) => {
      addEventListener("touchstart", handleTouchStart);
    });
    Array.from(sections).forEach((section) => {
      addEventListener("touchend", handleTouchEnd);
    });

    Array.from(sections).forEach((section) => {
      addEventListener("dragstart", handleTouchStart);
    });
    Array.from(sections).forEach((section) => {
      addEventListener("dragend", handleTouchEnd);
    });
  }

  const searchField = document.getElementById("search-text");
  searchField.addEventListener("input", debounce(handleSearch, 500));
}

const handleClickFilter = async (event) => {

  const button = document.getElementById(event.target.id);
  if (button.classList.contains("active")) {
    button.classList.remove("active");
    button.classList.add("inactive");
    companyData.activeFilters[event.target.id] = false;
  } else {
    // filterAssets(event, assetsAndLocations);
    button.classList.remove("inactive");
    button.classList.add("active");
    companyData.activeFilters[event.target.id] = true;
  }
  if(companyData.noFiltersActive){
    renderLocations(companyData)
    return;
  }
  companyData.filterBySensorOrCritical();
  renderFilteredLocations(companyData);
};

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function handleSearch(event) {
  if(!event.target.value) {
    renderLocations();
    return;
  }
  companyData.filterByText(event.target.value);
  renderFilteredLocations()
}


let startInteractionPosition;
const handleTouchStart = (event) => {
  startInteractionPosition = event.touches[0].clientX;
};

const handleTouchEnd = (event) => {
  if (!startInteractionPosition) return;
  const endInteractionPosition = event.changedTouches[0].clientX;
  const diffPosition = endInteractionPosition - startInteractionPosition;
  const newPosition = diffPosition > 0 ? -1 : 1;
  const searchSection = document.getElementById("nav-bar");
  const assetsSection = document.getElementById("assets-container");
  if (newPosition === 1) {
    searchSection.classList.remove("open");
    searchSection.classList.add("closed");

    assetsSection.classList.remove("closed");
    // assetsSection.classList.add("scaleInX")
    assetsSection.classList.add("open");
    assetsSection.classList.add("start-from-right");

    setTimeout(() => {
      // assetsSection.classList.remove("scaleInX")
      assetsSection.classList.add("start-from-right");
    }, 500);
  } else {
    assetsSection.classList.remove("open");
    assetsSection.classList.add("closed");

    searchSection.classList.remove("closed");
    searchSection.classList.add("scaleInX");
    searchSection.classList.add("open");

    setTimeout(() => {
      searchSection.classList.remove("scaleInX");
    }, 500);
  }
};

async function handleClickUnitButton(event) {
  const {
    currentTarget: { id },
  } = event;
  const button = document.getElementById(event.currentTarget?.id);
  const isActive = (button) => button.classList.contains("active");

  const unitButtons = document.getElementsByClassName("unit");
  const activeUnit = document.getElementById("active-unit-name");
  const unitText = document.getElementById(`${id}-name`);

  const assetsContainer =
    document.getElementsByClassName("assets-container")[0];
  assetsContainer.replaceChildren();
  assetsContainer.classList.remove("scale-in-height");
  Array.from(unitButtons).forEach((button) => {
    if (isActive(button) && button.id !== id) {
      button.classList.remove("active");
    }
  });
  if (isActive(button)) {
    button.classList.remove("active");
    return;
  }
  if (activeUnit) {
    activeUnit.innerText = ` / ${unitText.innerText}`;
  }
  button.classList.add("active");

  const companyLocations = await getCompanyLocations(id);
  const subLocations = companyLocations.map((el) =>
    el.parentId ? { ...el, isLocation: true } : null
  );
  const assets = [
    ...(await getCompanyAssets(id)),
    ...subLocations.filter((el) => el),
  ];
  const rootLocations = companyLocations.filter(el => !el.parentId)
  companyData.locations = rootLocations
  companyData.assets = assets
  const energySensorButton = document.getElementById("energy-sensor-filter");
  energySensorButton.classList.remove("active");
  energySensorButton.onclick = (event) =>
    handleClickFilter(event);

  const criticalButton = document.getElementById("critical-filter");
  criticalButton.classList.remove("active");
  criticalButton.onclick = (event) =>
    handleClickFilter(event);

  renderLocations();
}

function renderUnlinkedComponents(components, parent, assets) {
  const assetsContainer =
    document.getElementsByClassName("assets-container")[0];
  components.forEach((component) => {
    renderComponent(component, assetsContainer, assets);
  });
}

function addArrowIfHasChildren(assets, parent, currentAsset) {
  const groupedByLocationAndParent = groupAssets(assets);
  const hasChildren = groupedByLocationAndParent[currentAsset.id];
  if (hasChildren || !(currentAsset.type === "component")) {
    const arrow = document.createElement("span");
    arrow.classList.add("company-data-arrow");
    arrow.appendChild(createElementFromHTML(arrowSVG));
    parent.appendChild(arrow);
  } else {
    parent.style.marginLeft = "18px";
  }
}

// function getFilteredAssets(event, assetsAndLocations) {
//   if (event.target.id.includes("energy"))
//     return assetsAndLocations.filter((el) => el.sensorType === "energy");
//   return assetsAndLocations.filter((el) => el.status === "alert");
// }

// function filterAssets(event, assetsAndLocations) {
//   const filteredComponents = getFilteredAssets(event, assetsAndLocations);
//   const filteredAssets = new Map();
//   const filteredRootLocations = new Map();
//   filteredComponents.forEach((component) =>
//     filteredAssets.set(component.id, component)
//   );
//   const asMap = new Map();
//   assetsAndLocations.forEach((asset) => asMap.set(asset.id, asset));
//   const addParents = (asset) => {
//     if (!asset) return;
//     if (!asset.parentId && !asset.locationId) {
//       filteredRootLocations.set(asset.id, asset);
//       return;
//     }
//     const parent = asMap.get(asset.parentId) ?? asMap.get(asset.locationId);
//     filteredAssets.set(parent.id, parent);
//     addParents(parent);
//   };
//   filteredComponents.forEach(addParents);
//   renderFilteredLocations(filteredRootLocations, filteredAssets);
// }

function renderFilteredLocations() {
  const locations = companyData.filteredLocations
  const assets = companyData.filteredAssets
  const parent = document.getElementsByClassName("assets-container")[0];
  parent.replaceChildren();
  locations.values().forEach((location) => {
    if (location.parentId) return;

    const button = document.createElement("button");
    button.classList.add("company-data");
    button.classList.add("open");
    button.id = location.id;

    const container = document.createElement("div");
    container.classList.add("company-data-container");

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("company-data-content");
    contentContainer.style = "margin-left: 8px;";

    const arrow = document.createElement("span");
    arrow.classList.add("company-data-arrow");
    arrow.appendChild(createElementFromHTML(arrowSVG));
    button.appendChild(arrow);

    const textSpan = document.createElement("span");
    textSpan.innerText = location.name;

    button.addEventListener("click", (event) =>
      handleClickLocationAsset(event, assets)
    );

    button.appendChild(createElementFromHTML(locationsSVG));
    button.appendChild(textSpan);
    container.appendChild(button);
    container.appendChild(contentContainer);
    parent.appendChild(container);
    renderFilteredButtonsByType([...assets.values()], location.id, companyData.assets);
  });
  const unlinkedComponents = [...assets.values()].filter(
    (asset) => asset.sensorType && !asset.locationId && !asset.parentId
  );
  renderUnlinkedComponents(unlinkedComponents, parent, [...assets.values()]);
}

function renderLocations() {
  const locations = companyData.locations;
  const assets = companyData.assets
  const parent = document.getElementsByClassName("assets-container")[0];
  parent.replaceChildren()
  locations.forEach((location) => {
    if (location.parentId) return;
    const button = document.createElement("button");
    const container = document.createElement("div");
    container.classList.add("company-data-container");
    const contentContainer = document.createElement("div");
    contentContainer.classList.add("company-data-content");
    contentContainer.style = "margin-left: 8px;";

    button.classList.add("company-data");
    button.classList.add("closed");
    button.id = location.id;

    addArrowIfHasChildren(assets, button, location);

    const textSpan = document.createElement("span");
    textSpan.innerText = location.name;

    button.addEventListener("click", (event) =>
      handleClickLocationAsset(event, assets)
    );

    button.appendChild(createElementFromHTML(locationsSVG));
    button.appendChild(textSpan);
    container.appendChild(button);
    container.appendChild(contentContainer);
    parent.appendChild(container);
  });
  parent.classList.add("scale-in-height");
  const unlinkedComponents = assets.filter(
    (asset) => asset.sensorType && !asset.locationId && !asset.parentId
  );
  renderUnlinkedComponents(unlinkedComponents, parent, assets);
}

const handleClickLocationAsset = (event, assets) => {
  const {
    target: { id },
  } = event;
  const arrow = document.getElementById(id);
  if (arrow.classList.contains("open")) {
    arrow.classList.remove("open");
    arrow.classList.add("closed");
    arrow.nextElementSibling.replaceChildren();
    return;
  }
  arrow.classList.remove("closed");
  arrow.classList.add("open");
  renderButtonsByType(assets, id);
};

const groupAssets = (assets) => {
  const groupedByLocation = Object.groupBy(
    assets,
    ({ locationId }) => locationId
  );
  const groupedByParent = Object.groupBy(assets, ({ parentId }) => parentId);
  const groupedByLocationAndParent = {
    ...groupedByLocation,
    ...groupedByParent,
  };
  return groupedByLocationAndParent;
};

const renderFilteredButtonsByType = (filteredAssets, parentId, allAssets) => {
  const parent = document.getElementById(parentId).parentElement;
  const parentContentContainer = parent.lastChild;
  const groupedByLocationAndParent = groupAssets(filteredAssets);
  const assetsOnParentId = groupedByLocationAndParent[parentId];
  const withTypeHints = addTypesToAssets(assetsOnParentId);

  withTypeHints.forEach((asset) => {
    const container = document.createElement("div");
    container.classList.add("company-data-container");

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("company-data-content");

    const button = document.createElement("button");
    button.classList.add("company-data");
    button.id = asset.id;

    addArrowIfHasChildren(filteredAssets, button, asset);

    if (asset.type === "component") {
      renderComponent(asset, parentContentContainer, filteredAssets);
      return;
    }

    if(!groupedByLocationAndParent[asset.id]){
      const textSpan = document.createElement("span");
      textSpan.innerText = asset.name;

      button.classList.add("closed");

  
      button.addEventListener("click", (event) =>
        handleClickLocationAsset(event, allAssets)
      );
  
      const svg = dataTypeSVGMapper[asset.type];
  
      button.appendChild(createElementFromHTML(svg));
      button.appendChild(textSpan);
  
      container.appendChild(button);
      container.appendChild(contentContainer);
  
      parentContentContainer.appendChild(container);
      renderFilteredButtonsByType(filteredAssets, asset.id, allAssets);
      return
    }
    button.classList.add("open");

    const textSpan = document.createElement("span");
    textSpan.innerText = asset.name;

    button.addEventListener("click", (event) =>
      handleClickLocationAsset(event, filteredAssets)
    );

    const svg = dataTypeSVGMapper[asset.type];

    button.appendChild(createElementFromHTML(svg));
    button.appendChild(textSpan);

    container.appendChild(button);
    container.appendChild(contentContainer);

    parentContentContainer.appendChild(container);
    renderFilteredButtonsByType(filteredAssets, asset.id);
  });
};

const renderButtonsByType = (assets, parentId) => {
  const parent = document.getElementById(parentId).parentElement;
  const parentContentContainer = parent.lastChild;
  const groupedByLocationAndParent = groupAssets(assets);
  const assetsOnParentId = groupedByLocationAndParent[parentId];
  const withTypeHints = addTypesToAssets(assetsOnParentId);
  withTypeHints.forEach((asset) => {
    const container = document.createElement("div");
    container.classList.add("company-data-container");

    const contentContainer = document.createElement("div");
    contentContainer.classList.add("company-data-content");

    const button = document.createElement("button");
    button.classList.add("company-data");
    button.classList.add("closed");
    button.id = asset.id;

    addArrowIfHasChildren(assets, button, asset);

    if (asset.type === "component") {
      renderComponent(asset, parentContentContainer, assets);
      return;
    }

    const textSpan = document.createElement("span");
    textSpan.innerText = asset.name;

    button.addEventListener("click", (event) =>
      handleClickLocationAsset(event, assets)
    );

    const svg = dataTypeSVGMapper[asset.type];

    button.appendChild(createElementFromHTML(svg));
    button.appendChild(textSpan);

    container.appendChild(button);
    container.appendChild(contentContainer);

    parentContentContainer.appendChild(container);
  });
};

const renderComponent = (asset, parent, assets) => {
  const container = document.createElement("div");
  container.classList.add("company-data-container");

  const button = document.createElement("button");
  button.id = asset.id;
  button.classList.add("company-data");
  button.classList.add("closed");
  button.style = "margin-left: 16px;";

  const textSpan = document.createElement("span");
  textSpan.innerText = asset.name;

  button.addEventListener("click", (event) =>
    handleClickComponent(event, assets)
  );

  const img = document.createElement("img");
  img.src = "/assets/component.png";
  img.width = 22;

  button.appendChild(img);
  button.appendChild(textSpan);

  const isCritical = asset.status === "alert";
  const isEnergy = asset.sensorType === "energy";

  if (isEnergy) {
    button.appendChild(createElementFromHTML(boltSVG));
    button.classList.add("energy");
  }

  const statusDisplay = document.createElement("span");
  statusDisplay.classList.add("status-display");

  if (isCritical) {
    statusDisplay.classList.add("critical");
    button.classList.add("critical");
  } else {
    statusDisplay.classList.add("operating");
    button.classList.add("critical");
  }

  button.appendChild(statusDisplay);

  container.appendChild(button);

  parent.appendChild(container);
};

const handleClickComponent = (event, assets) => {
  const {
    target: { id },
  } = event;
  const selectedComponent = assets.find((el) => el.id === id);
  const title = document.getElementById("asset-title");
  const responsible = document.getElementById("asset-responsible");
  const responsibleAvatar = document.getElementById("asset-responsible-avatar");
  const type = document.getElementById("asset-type");
  const sensor = document.getElementById("asset-sensor");
  const gateway = document.getElementById("asset-gateway");

  title.innerText = selectedComponent.name;
  if (selectedComponent.responsible) {
    responsible.innerText = selectedComponent.responsible;
    responsibleAvatar.innerText =
      selectedComponent.responsible[0].toUpperCase();
  }
  type.innerText = selectedComponent.type;
  sensor.innerText = selectedComponent.sensorId;
  gateway.innerText = selectedComponent.gatewayId;
};

const handleSidebarOpen = (event) => {
  const sidebarOpen = document.getElementById("nav-bar");
  const header = document.getElementsByTagName("header");
  const buttons = document.getElementsByClassName("unit");
  Array.from(buttons).forEach((button) => {
    button.classList.add("scaleOutButtons");
  });
  // buttonsContainer[0].classList.add('scaleOutY')
  header[0].classList.add("scaleOutY");
  sidebarOpen.classList.add("scaleInX");
  sidebarOpen.style.display = "block";
};

const handleSidebarClose = (event) => {
  const sidebarOpen = document.getElementById("nav-bar");
  sidebarOpen.style.display = "none";
};
