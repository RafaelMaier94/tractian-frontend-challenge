document.addEventListener("DOMContentLoaded", function() {
    addListeners()

});

function addListeners (){
    const unitButtons = document.getElementsByClassName("unit")
    Array.from(unitButtons).forEach(button => {
        button.addEventListener('click', handleClickUnitButton)
    })

    const sidebar = document.getElementById('sidebar--closed');
    if(sidebar){
        sidebar.addEventListener("click", handleSidebarOpen)
    }

}

const transformIn = "@keyframes transformIn {" +
                    "from {" + 
                    "transform: scaleX(0);" + 
                    "}" + 
                    "to {" + 
                    "transform: scaleX(1);" + 
                    "}}"

const handleClickUnitButton = (event) => {
    const { currentTarget: { id } } = event
    const button = document.getElementById(event.currentTarget?.id)
    const isActive = (button) => button.classList.contains("active")
    const unitButtons = document.getElementsByClassName("unit")
    const activeUnit = document.getElementById('active-unit-name');
    const unitText = `${id[0].toUpperCase()}${id.substring(1, id.length)} unit`
    console.log({unitText})
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
    const sidebarClosed = document.getElementById('sidebar--closed');
    const sidebarOpen = document.getElementById('sidebar--open');
    const header = document.getElementsByTagName("header");
    const buttons = document.getElementsByClassName("unit");
    Array.from(buttons).forEach((button) => {
        button.classList.add('scaleOutButtons')
    })
    // buttonsContainer[0].classList.add('scaleOutY')
    header[0].classList.add('scaleOutY')
    sidebarOpen.classList.add("scaleInX")
    sidebarOpen.style.display = 'block';
    sidebarClosed.style.display = 'none';
}

const handleSidebarClose = (event) => {
    const sidebarClosed = document.getElementById('sidebar--closed');
    const sidebarOpen = document.getElementById('sidebar--open');
    sidebarOpen.style.display = 'none';
    sidebarClosed.style.display = 'block';
}