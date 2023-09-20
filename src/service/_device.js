const checkUserDevicesOnLogin = async (user, deviceInfo) => {
    // Query the database to retrieve the user's registered devices
    const registeredDevices = getUserDevices(user);

    // Check if the current device matches any registered devices
    const isNewDevice = !registeredDevices.some((registeredDevice) =>
        isSameDevice(registeredDevice, deviceInfo)
    );

    if (isNewDevice) {
        // Send an email notification to the user about the new device
        sendDeviceAccessConfirmationEmail(user, deviceInfo);
    }
};

// Example of checking user devices periodically
const checkUserDevicesPeriodically = () => {
    // Get a list of active user sessions and their associated devices
    const activeSessions = getActiveSessions();

    // Iterate through active sessions and compare devices
    for (const session of activeSessions) {
        const userId = session.userId;
        const deviceInfo = session.deviceInfo;

        // Query the database to retrieve the user's registered devices
        const registeredDevices = getUserDevices(userId);

        // Check if the current device matches any registered devices
        const isNewDevice = !registeredDevices.some((registeredDevice) =>
            isSameDevice(registeredDevice, deviceInfo)
        );

        if (isNewDevice) {
            // Send an email notification to the user about the new device
            sendDeviceAccessConfirmationEmail(userId, deviceInfo);
        }
    }
};

// Example of sending a device access confirmation email
const sendDeviceAccessConfirmationEmail = (userId, deviceInfo) => {
    const emailContent = `A new device was detected accessing your account. 
    Device Info: ${deviceInfo}
    <a href="/confirm-device?userId=${userId}&deviceId=${deviceInfo.deviceId}&action=confirm">Confirm</a>
    <a href="/confirm-device?userId=${userId}&deviceId=${deviceInfo.deviceId}&action=deny">Deny</a>`;

    // Send the email to the user
    // Implement your email sending logic here
};