import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { auth } from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "",
    phoneNumber: "",
    address: "",
    bio: "",
    profileImage: null,
  });

  const db = getFirestore();
  const storage = getStorage();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setProfileData({
            ...profileData,
            ...userDoc.data(),
            displayName: userDoc.data().displayName || auth.currentUser.email,
          });
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setProfileData({ ...profileData, profileImage: imageUri });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `profile_${
        auth.currentUser.uid
      }_${new Date().getTime()}`;
      const storageRef = ref(storage, `profileImages/${fileName}`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw new Error("Failed to upload image");
    }
  };

  const updateProfile = async () => {
    if (!profileData.displayName) {
      Alert.alert("Error", "Name is required");
      return;
    }

    setUpdating(true);
    try {
      let imageUrl = profileData.profileImage;

      // new image 
      if (
        profileData.profileImage &&
        profileData.profileImage.startsWith("file://")
      ) {
        imageUrl = await uploadImage(profileData.profileImage);
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(
        userRef,
        {
          displayName: profileData.displayName,
          phoneNumber: profileData.phoneNumber,
          address: profileData.address,
          bio: profileData.bio,
          profileImage: imageUrl,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage}>
          {profileData.profileImage ? (
            <Image
              source={{ uri: profileData.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {profileData.displayName?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.displayName}
          onChangeText={(text) =>
            setProfileData({ ...profileData, displayName: text })
          }
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={profileData.phoneNumber}
          onChangeText={(text) =>
            setProfileData({ ...profileData, phoneNumber: text })
          }
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={profileData.address}
          onChangeText={(text) =>
            setProfileData({ ...profileData, address: text })
          }
          placeholder="Enter your address"
          multiline
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={profileData.bio}
          onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.updateButton, updating && styles.updatingButton]}
          onPress={updateProfile}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.updateButtonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E1E1E1",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    color: "#757575",
  },
  changePhotoText: {
    marginTop: 10,
    color: "#007BFF",
    fontSize: 16,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
  },
  updateButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  updatingButton: {
    opacity: 0.7,
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});