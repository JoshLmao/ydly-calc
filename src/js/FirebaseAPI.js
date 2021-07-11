import firebase from "firebase/app";
import "firebase/database";

import CONFIG from "../config.json";

export function isFirebaseInitialized() {
    return firebase.apps.length > 0;
}

export function initFirebase() {
    // Get API key and Database url from environment variables
    let apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
    let databaseUrl = process.env.REACT_APP_FIREBASE_DATABASE_URL;
    if (!CONFIG.firebase_config || !apiKey || !databaseUrl) {
        console.error("Error initializing Firebase. Is the config set correctly? Have you set environment variables?");
        return;            
    }

    if (!isFirebaseInitialized()) {
        // Initialize Firebase if not already
        let fullConfig = {
            apiKey: apiKey,
            databaseURL: databaseUrl,
            projectId: CONFIG.firebase_config.projectId,
            authDomain: CONFIG.firebase_config.authDomain,
            storageBucket: CONFIG.firebase_config.storageBucket,
        };
        firebase.initializeApp(fullConfig);
    } 
}

export function getApplicationData (appID, limit, dataCallback) {
    firebase.database().ref(`${appID}/`).limitToFirst(limit).once('value').then((snapshot) => {
        if (dataCallback) {
            dataCallback(snapshot.val());
        }
    });
}

export function getAllData (dataCallback) {
    firebase.database().ref(`/`).once('value').then((snapshot) => {
        if (dataCallback) {
            dataCallback(snapshot.val());
        }
    });
}