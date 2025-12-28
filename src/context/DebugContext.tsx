import { useState, createContext, useContext } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

export const DebugContext = createContext(false);

export function DebugProvider({ children }) {
    const [debugMode, setDebugMode] = useState(false);

    const longPressGesture = Gesture.LongPress().numberOfPointers(2).runOnJS(true).onEnd((e, success) => {
        if (success && e.duration >= 2000) {
            setDebugMode(!debugMode);
            Toast.show({
                type: 'info',
                text1: `Debug mode has been switched ${debugMode ? 'off' : 'on'}`,
                position: 'bottom',
                visibilityTime: 3000
            })
        }
    });

    return (
        <GestureDetector gesture={longPressGesture}>
            <DebugContext.Provider value={debugMode}>
                {children}
            </DebugContext.Provider>
        </GestureDetector>
    );
}