import { getCompanies, getCompanyLocations } from "./api.js";
import { arrowSVG, companiesSVG, locationsSVG } from "./svgMappers.js";

document.addEventListener("DOMContentLoaded", function() {
    addListeners()
    const innerWidth = window.innerWidth

    if(innerWidth <= 768){
        const assetsContainer = document.getElementById("assets-container");
        assetsContainer.classList.remove("open")
        assetsContainer.classList.add("closed")
    }

});
loadCompanies()

function createElementFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild;
}

async function loadCompanies() {
    const companies = await getCompanies();
    const companiesContainer = document.getElementById("companies-container");
    companies.forEach(({name, id}) => {

        const button = document.createElement("button")
        button.className = "unit"
        button.id = id

        const text = document.createElement("span")
        text.id = `${id}-name`
        text.innerText = `${name} Unit`

        button.appendChild(createElementFromHTML(companiesSVG))
        button.appendChild(text)
        companiesContainer.appendChild(button)
    })
    const unitButtons = document.getElementsByClassName("unit")
    Array.from(unitButtons).forEach(button => {
        button.addEventListener('click', handleClickUnitButton)
    })

}

loadLocations()

async function loadLocations() {
    const locations = await getCompanyLocations("662fd0ee639069143a8fc387");
    console.log(locations)
}


function addListeners (){
    const innerWidth = window.innerWidth
    if (innerWidth <= 768){
        console.log("inside")
        const sections = document.getElementsByClassName('content-container');
        Array.from(sections).forEach(section => {addEventListener('touchstart', handleTouchStart)})
        Array.from(sections).forEach(section => {addEventListener('touchend', handleTouchEnd)})

        Array.from(sections).forEach(section => {addEventListener('dragstart', handleTouchStart)})
        Array.from(sections).forEach(section => {addEventListener('dragend', handleTouchEnd)})
    }
    const searchField = document.getElementById("search-text");
    searchField.addEventListener('input', debounce(handleSearch, 500))
    const locationsButtons = document.getElementsByClassName("location");
    Array.from(locationsButtons).forEach(button => button.addEventListener("click", handleLocationsArrow))

}


function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
}

function handleSearch(event) {
    console.log(event)
    console.log(event.target.value)
}

let startInteractionPosition;
const handleTouchStart = (event) => {
    startInteractionPosition = event.touches[0].clientX
}

const handleTouchEnd = (event) => {
    if (!startInteractionPosition) return;
    const endInteractionPosition = event.changedTouches[0].clientX;
    const diffPosition = endInteractionPosition - startInteractionPosition;
    const newPosition = diffPosition > 0 ? -1 : 1;
    const searchSection = document.getElementById("nav-bar")
    const assetsSection = document.getElementById("assets-container")
    if (newPosition === 1){
        searchSection.classList.remove("open")
        searchSection.classList.add("closed")

        assetsSection.classList.remove("closed")
        // assetsSection.classList.add("scaleInX")
        assetsSection.classList.add("open")
        assetsSection.classList.add("start-from-right")

        setTimeout(() => {
            // assetsSection.classList.remove("scaleInX")
            assetsSection.classList.add("start-from-right")
        }, 500)
        
    }else{

        assetsSection.classList.remove("open")
        assetsSection.classList.add("closed")

        searchSection.classList.remove("closed")
        searchSection.classList.add("scaleInX")
        searchSection.classList.add("open")

        setTimeout(() => {
            searchSection.classList.remove("scaleInX")
        }, 500)


    }

}
async function handleClickUnitButton (event) {
    const { currentTarget: { id } } = event;
    const button = document.getElementById(event.currentTarget?.id);
    const isActive = (button) => button.classList.contains("active");
    const unitButtons = document.getElementsByClassName("unit");
    const activeUnit = document.getElementById('active-unit-name');
    const unitText = document.getElementById(`${id}-name`)
    // activeUnit.innerHTML = 
    Array.from(unitButtons).forEach(button => {
        if (isActive(button) && button.id !== id){
            button.classList.remove("active")
        }
    })
    if(isActive(button)){
        button.classList.remove("active")
        return;
    }
    if(activeUnit){
        activeUnit.innerText = ` / ${unitText.innerText}`
    }
    button.classList.add("active")
    const locations = await getCompanyLocations(id)
    renderLocations(locations)
}

const handleLocationsArrow = (event) => {
    console.log(event.target)
    const arrow = document.getElementById(event.target.id);
    if(arrow.classList.contains("open")){
        arrow.classList.remove("open")
        arrow.classList.add("closed")
    } else {
        arrow.classList.remove("closed")
        arrow.classList.add("open")
    }
}

const renderLocations = (locations) => {
    const parent = document.getElementsByClassName("assets-container")[0];
    console.log(parent)
    locations.forEach((location) => {
        const button = document.createElement("button");
        button.classList.add("location")
        button.classList.add("closed")
        button.id = location.id
        
        const arrow = document.createElement("span");
        arrow.classList.add("location-arrow");
        arrow.appendChild(createElementFromHTML(arrowSVG));

        const textSpan = document.createElement("span");
        textSpan.innerText = location.name;

        button.addEventListener("click", handleLocationsArrow)

        button.appendChild(arrow)
        button.appendChild(createElementFromHTML(locationsSVG))
        button.appendChild(textSpan)
        console.log(parent)

        parent.appendChild(button)
    })
}

const handleSidebarOpen = (event) => {
    const sidebarOpen = document.getElementById('nav-bar');
    const header = document.getElementsByTagName("header");
    const buttons = document.getElementsByClassName("unit");
    Array.from(buttons).forEach((button) => {
        button.classList.add('scaleOutButtons')
    })
    // buttonsContainer[0].classList.add('scaleOutY')
    header[0].classList.add('scaleOutY')
    sidebarOpen.classList.add("scaleInX")
    sidebarOpen.style.display = 'block';
}

const handleSidebarClose = (event) => {
    const sidebarOpen = document.getElementById('nav-bar');
    sidebarOpen.style.display = 'none';
}