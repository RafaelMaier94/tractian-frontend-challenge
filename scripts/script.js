import { getCompanies } from "./api.js";
import { companiesSVG } from "./svgMappers.js";

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

async function loadCompanies () {
    const companies = await getCompanies();
    const companiesContainer = document.getElementById("companies-container");
    companies.forEach(({name}) => {

        const button = document.createElement("button")
        button.className = "unit"
        button.id = name

        const text = document.createElement("span")
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

getCompanies();

function addListeners (){
    const sidebar = document.getElementById('sidebar--closed');
    if(sidebar){
        sidebar.addEventListener("click", handleSidebarOpen)
    }
    const innerWidth = window.innerWidth
    if (innerWidth <= 768){
        console.log("inside")
        const sections = document.getElementsByClassName('content-container');
        Array.from(sections).forEach(section => {addEventListener('touchstart', handleTouchStart)})
        Array.from(sections).forEach(section => {addEventListener('touchend', handleTouchEnd)})

        Array.from(sections).forEach(section => {addEventListener('dragstart', handleTouchStart)})
        Array.from(sections).forEach(section => {addEventListener('dragend', handleTouchEnd)})
    }

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

function handleClickUnitButton (event) {
    const { currentTarget: { id } } = event
    const button = document.getElementById(event.currentTarget?.id)
    const isActive = (button) => button.classList.contains("active")
    const unitButtons = document.getElementsByClassName("unit")
    const activeUnit = document.getElementById('active-unit-name');
    const unitText = `${id} Unit`
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
        activeUnit.innerText = ` / ${unitText}`
    }

    button.classList.add("active")
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