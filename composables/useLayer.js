import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ.js";
import OSM from "ol/source/OSM";
import TileWMS from "ol/source/TileWMS";
import GeoJSON from "ol/format/GeoJSON.js";
export const useLayerData = () => {
  const ordinaryMap = new TileLayer({
    name: "ordinaryMap",
    source: new XYZ({
      url: "https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}",
      crossOrigin: "anonymous",
    }),

    visible: true,
    id: "map01",
    zIndex: 0,
  });

  //地籍圖
  const dmaps = new TileLayer({
    name: "imageMap",
    source: new XYZ({
      url: "https://landmaps.nlsc.gov.tw/S_Maps/wmts/DMAPS/default/GoogleMapsCompatible/{z}/{y}/{x}",
      crossOrigin: "anonymous",
    }),
    visible: false,
    id: "map02",
    zIndex: 2,
  });
  //段籍圖
  const landsect = new TileLayer({
    name: "landsect",
    source: new XYZ({
      url: "https://wmts.nlsc.gov.tw/wmts/LANDSECT/default/GoogleMapsCompatible/{z}/{y}/{x}",
      crossOrigin: "anonymous",
    }),
    visible: false,
    id: "map03",
    zIndex: 3,
  });

  const urbanLandZone = new TileLayer({
    name: "urbanLandZone",
    source: new TileWMS({
      url: "https://giss.tcd.gov.tw/tcdmap/services/WebService/URBAN_LANDUSE_ZONE/MapServer/WMSServer",
      params: {
        LAYERS: "1,2,3,4",
        FORMAT: "image/png",
        TRANSPARENT: true,
        VERSION: "1.1.1",
        SRS: "EPSG:3857",
        // 'token': 'Kt_8HF9ZGVqWNZERWppk6KOiWGpLzwuTTWLcfA-IPqg6mm_zafb0Gm7ctxRpClThAD0AnXBctpwfT5xdrq7YjA5IQWcdqnsMMSGpD4wgOzA.',
        token:
          "Kt_8HF9ZGVqWNZERWppk6KOiWGpLzwuTTWLcfA-IPqho4tjqCk-faANmV23-8ruVbSipydz1O272AtSBUcjSx2UikQYDNWRXwirbK66-uV0j-9LJPzdUDTDh1EBjDmiK",
      },
      serverType: "geoserver",
      crossOrigin: "anonymous",
    }),
    visible: false,
    opacity: 0.5,
    id: "map04",
    zIndex: 1,
  });

  const streetMap = new TileLayer({
    name: "streetMap",
    source: new OSM(),
    id: "map05",
    visible: false,
  });

  //淺色地圖
  const cartoPositron = new TileLayer({
    name: "CartoDB Positron",
    source: new XYZ({
      url: "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      crossOrigin: "anonymous",
    }),
    visible: false,
    zIndex: 3,
  });
  //深色
  const cartoDarkMatter = new TileLayer({
    name: "CartoDB Dark",
    source: new XYZ({
      url: "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      crossOrigin: "anonymous",
    }),
    visible: false,
    zIndex: 4,
  });

  //衛星地圖
  const esriImagery = new TileLayer({
    name: "Esri Imagery",
    source: new XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      crossOrigin: "anonymous",
    }),
    visible: false,
    zIndex: 3,
  });

  return {
    ordinaryMap,
    dmaps,
    urbanLandZone,
    streetMap,
    landsect,
    cartoPositron,
    cartoDarkMatter,
    esriImagery,
  };
};
