const Plan = require('../models/plans')
const Preference = require('../models/userPrefference')
const MyUser=require('../models/user')

exports.submitDetails = async (req, res) => {
  const { fullName, address, collegeName, companyName, agencyName } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const additionalInfo = {};

  if (user.role === 'student') {
    additionalInfo.fullName = fullName;
    additionalInfo.address = address;
    additionalInfo.collegeName = collegeName;
  } else if (user.role === 'professional') {
    additionalInfo.fullName = fullName;
    additionalInfo.companyName = companyName;
  } else if (user.role === 'agency') {
    additionalInfo.agencyName = agencyName;
    additionalInfo.address = address;
  }

  if (req.file) {
    user.document = req.file.filename;
  }

  user.additionalInfo = additionalInfo;
  await user.save();

  res.status(200).json({ message: 'Details submitted successfully' });
};
exports.getPlansByCategory = async (req, res) => {
  try {
    const category = req.body.category;

    let plans;
    if (!category || category === 'all') {
      plans = await Plan.find({});
    } else {
      // Case-insensitive category match
      plans = await Plan.find({ category: category });
    }

    if (plans.length === 0) {
      return res.status(404).json({ message: 'No plans found for this category', Status: 404 });
    }

    res.status(200).json({ plans, Status: 200 });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Server error', Status: 500 });
  }
};
exports.savePreference = async (req, res) => {
  const userId = req.user.id;

  const prefference = req.body.prefference;
  const basicDetails = req.body.basic_data;

  if (!prefference || !basicDetails) {
    return res.status(400).json({
      message: 'Preference and basicDetails are required',
      Status: 400,
    });
  }

  try {
    let existingPref = await Preference.findOne({ userId });

    if (existingPref) {
      if (existingPref.userHavePreference) {
        // User already submitted preference, no update allowed
        return res.status(403).json({
          message: 'Preference already submitted and cannot be updated',
          Status: 403,
        });
      } else {
        // Update existing preference and mark as submitted
        existingPref.prefference = prefference;
        existingPref.basicDetails = basicDetails;
        existingPref.userHavePreference = true;
        await existingPref.save();

        await MyUser.findByIdAndUpdate(userId, { havePreference: true });

        return res.status(200).json({
          message: 'Preferences saved successfully',
          Status: 200,
        });
      }
    } else {
      // Create new preference and mark as submitted
      const newPref = new Preference({
        userId,
        prefference,
        basicDetails,
        userHavePreference: true,
      });

      await newPref.save();
      await MyUser.findByIdAndUpdate(userId, { havePreference: true }); // ✅ important line

      return res.status(201).json({
        message: 'Preferences saved successfully',
        userHavePreference: true,
        Status: 201,
      });
    }
  } catch (error) {
    console.error('Error saving preferences:', error);
    return res.status(500).json({
      message: 'Server error',
      Status: 500,
    });
  }
};

