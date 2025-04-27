import { Pressable, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface TabBarButtonProps {
    isFocused: boolean;
    label: string;
    routeName: string;
    color: string;
    onPress: () => void;
    onLongPress: () => void;
    children?: React.ReactNode;
}

const TabBarButton: React.FC<TabBarButtonProps> = ({ isFocused, label, routeName, color, onPress, onLongPress, children }) => {
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(isFocused ? 1 : 0, { damping: 10 });
    }, [scale, isFocused]);

    const animatedIconStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(scale.value, [0, 1], [1, 1.4]);
        const top = interpolate(scale.value, [0, 1], [0, -8]);

        return {
            transform: [{ scale: scaleValue }],
            top,
        };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scale.value, [0, 1], [1, 0]);

        return {
            opacity,
        };
    });

    return (
        <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.container}>
            <Animated.View style={[animatedIconStyle]}>
                {children}
            </Animated.View>
            <Animated.Text style={[{ color, fontSize: 11 }, animatedTextStyle]}>
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
