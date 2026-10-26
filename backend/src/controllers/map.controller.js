import captainModel from "../models/captain.model.js";

// Fetch active captains within a specified radius (in kilometers)
export const getCaptainsInRadius = async (ltd, lng, radius = 5) => {
  try {
    const captains = await captainModel.find({
      status: "active",
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(ltd), parseFloat(lng)], radius / 6378.1],
        },
      },
    });
    return captains;
  } catch (error) {
    console.error("Error finding nearby captains:", error);
    throw error;
  }
};

// Express controller endpoint to fetch nearby captains for UI map display
export const getNearbyCaptains = async (req, res) => {
  const { ltd, lng, radius } = req.query;

  if (!ltd || !lng) {
    return res.status(400).json({ message: "Latitude and Longitude are required" });
  }

  try {
    const captains = await getCaptainsInRadius(ltd, lng, radius);
    return res.status(200).json(captains);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch nearby captains" });
  }
};