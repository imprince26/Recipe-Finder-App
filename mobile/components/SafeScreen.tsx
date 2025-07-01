import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import React from "react";

const SafeScreen = ({ children }: { children: React.ReactNode }) => {

    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                paddingTop: insets.top,
                flex: 1,
                backgroundColor: COLORS.background
            }}
        >
            {children}
        </View>
    )
}

export default SafeScreen