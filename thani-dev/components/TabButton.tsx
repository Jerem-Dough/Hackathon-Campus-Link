import { Pressable, StyleSheet, useColorScheme } from 'react-native';
import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

interface TabBarButtonProps {
    isFocused: boolean;
    label: string;
    routeName: string;
    color?: string;
    onPress: () => void;
    onLongPress: () => void;
    children?: React.ReactNode;
}

const TabBarButton: React.FC<TabBarButtonProps> = ({ isFocused, label, routeName, color, onPress, onLongPress, children }) => {
    const colorScheme = useColorScheme();
    const textColor = color || (colorScheme === 'dark' ? '#FFFFFF' : '#000000'); // Default to light theme color

    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            opacity: 1, // Keep the text always visible
        };
    });

    return (
        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.container}>
            <Animated.View>
                {children}
            </Animated.View>
            <Animated.Text style={[{ color: textColor, fontSize: 11 }, animatedTextStyle]}>
                {label}
            </Animated.Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
});

export default TabBarButton;
