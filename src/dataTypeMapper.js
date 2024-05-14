import { assetSVG, componentSVG, locationsSVG } from "./svgMappers.js";

export const addTypesToAssets = (data) => {
    if(!data) return [];
    const typedData = data.map(item => {
        if(item.sensorType) item["type"] = "component";
        if(!item.sensorType && !item.isLocation) item["type"] = "asset";
        if(item.isLocation) item["type"] = "location";
        return item;
    })
    return typedData
}

export const dataTypeSVGMapper = {
    component: componentSVG,
    asset: assetSVG,
    location: locationsSVG
}