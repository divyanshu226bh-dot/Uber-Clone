import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { FaCar, FaMotorcycle, FaMapMarkerAlt } from "react-icons/fa";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const createPinIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      width:32px;height:32px;border:3px solid white;
      border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      box-shadow:0 2px 7px #0005;display:flex;
      align-items:center;justify-content:center;">
      <div style="transform:rotate(45deg);color:white;font-weight:bold">
        ●
      </div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

const CaptainIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:42px;height:42px;background:#990011;color:white;
    border:3px solid white;border-radius:50%;
    box-shadow:0 2px 8px #0005;display:flex;
    align-items:center;justify-content:center;font-size:19px;">
    🚗
  </div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const PickupIcon = createPinIcon("#16803D");
const DestinationIcon = createPinIcon("#990011");

const RecenterMap = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (
      Array.isArray(center) &&
      center.length === 2 &&
      center.every(Number.isFinite)
    ) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const validPosition = (position) =>
  Array.isArray(position) &&
  position.length === 2 &&
  position.every(Number.isFinite);

const LiveMap = ({
  center = [26.801, 75.8058],
  zoom = 14,
  markers = [],
  pickupPosition = null,
  destinationPosition = null,
  routePositions = [],
  showPickup = true,
  showDestination = true,
  showCaptain = true,
  vehicleType = "car",
  showRadius = false,
}) => {
  return (
    <div className="h-full w-full overflow-hidden rounded-3xl shadow-inner">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <RecenterMap center={center} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={marker.type === "captain" ? CaptainIcon : DefaultIcon}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}

        {showCaptain && markers.length === 0 && validPosition(center) && (
          <Marker position={center} icon={CaptainIcon}>
            <Popup>
              {vehicleType === "motorcycle"
                ? "Captain — Motorcycle"
                : vehicleType === "auto"
                  ? "Captain — Auto"
                  : "Captain — Car"}
            </Popup>
          </Marker>
        )}

        {showPickup && validPosition(pickupPosition) && (
          <>
            {showRadius && (
              <Circle
                center={pickupPosition}
                radius={50}
                pathOptions={{
                  color: "#16803D",
                  fillColor: "#16803D",
                  fillOpacity: 0.12,
                }}
              />
            )}
            <Marker position={pickupPosition} icon={PickupIcon}>
              <Popup>Pickup location</Popup>
            </Marker>
          </>
        )}

        {showDestination && validPosition(destinationPosition) && (
          <>
            {showRadius && (
              <Circle
                center={destinationPosition}
                radius={50}
                pathOptions={{
                  color: "#990011",
                  fillColor: "#990011",
                  fillOpacity: 0.12,
                }}
              />
            )}
            <Marker position={destinationPosition} icon={DestinationIcon}>
              <Popup>Destination</Popup>
            </Marker>
          </>
        )}

        {routePositions.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: "#990011",
              weight: 5,
              opacity: 0.85,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;
