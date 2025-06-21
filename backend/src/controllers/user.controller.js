import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

//getRecommendedUsers:
export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude myself/user
        { _id: { $nin: currentUser.friends } }, //exclude my/user friends
        { isOnBoarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//getMyFriends:
export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullName profilePic nativeLanguage learningLanguage"
      );
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//sendFriendRequest:
export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    //Check if sending request to myself
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send request to yourself" });
    }

    //Check if recipient exist or not
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    //Check if user already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    //Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exist between you and this user",
      });
    }
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });
    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//acceptFriendRequest:
export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

  
    return res.status(200).json({
      message: "Friend request accepted successfully",
      requestId,
    });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


//getFriendRequests:
export async function getFriendRequests(req, res) {
  try {
    const incomingReq = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    const acceptedReq = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReq, acceptedReq });
  } catch (error) {
    console.error("Error in getFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//getOutgoingFriendReq:
export async function getOutgoingFriendReq(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage"
    );
    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendReq controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

//getprofile
export async function getUserProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      "fullName bio profilePic nativeLanguage learningLanguage location email"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile", error);
    res.status(500).json({ message: "Server error" });
  }
}

// update profile
export async function updateUserProfile(req, res) {
  try {
    const {
      fullName,
      bio,
      profilePic,
      nativeLanguage,
      learningLanguage,
      location,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName ?? user.fullName;
    user.bio = bio ?? user.bio;
    user.profilePic = profilePic ?? user.profilePic;
    user.nativeLanguage = nativeLanguage ?? user.nativeLanguage;
    user.learningLanguage = learningLanguage ?? user.learningLanguage;
    user.location = location ?? user.location;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error in updateUserProfile", error);
    res.status(500).json({ message: "Server error" });
  }
}
