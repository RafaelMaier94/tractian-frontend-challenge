import { assetSVG, componentSVG } from "./svgMappers.js";

export const addTypesToAssets = (data) => {
    if(!data) return [];
    const typedData = data.map(item => {
        if(item.sensorType) item["type"] = "component";
        if(item.locationId) item["type"] = "asset";
        return item;
    })
    return typedData
}

export const dataTypeSVGMapper = {
    component: componentSVG,
    asset: assetSVG
}