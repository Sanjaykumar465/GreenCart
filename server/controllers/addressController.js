import Address from "../models/Address.js";

// Add Address : /api/address/add
export const addAddress = async (req, res) => {
  try {
    const { address, userId } = req.body;

    // Validate required fields manually (better error messages)
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "street",
      "city",
      "state",
      "zipcode",
      "country",
      "phone"
    ];
    for (let field of requiredFields) {
      if (!address[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }

    await Address.create({ ...address, userId });
    res.json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Address : /api/address/get
export const getAddress = async (req, res) => {
  try {
    const { userId } = req.body;
    const addresses = await Address.find({ userId });
    res.json({ success: true, addresses }); // ✅ fixed variable name
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
