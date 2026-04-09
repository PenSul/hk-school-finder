import "../global.css";
import { Suspense, useEffect, type ReactNode } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useColorScheme } from "nativewind";
import { DATABASE_NAME } from "@/db/client";
import { createTables } from "@/db/schema";
import { migrateIfNeeded } from "@/db/migrations";
import { DatabaseProvider } from "@/providers/DatabaseProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";

/** Syncs our ThemeProvider colorScheme to NativeWind so dark: classes work */
function DarkModeSync({ children }: { children: ReactNode }) {
  const { colorScheme } = useTheme();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(colorScheme);
  }, [colorScheme, setColorScheme]);

  return <>{children}</>;
}

async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await createTables(db);
  await migrateIfNeeded(db);
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
      <Suspense fallback={
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1E3A5F" }}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", marginTop: 16 }}>Loading...</Text>
        </View>
      }>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        onInit={initDatabase}
      >
        <DatabaseProvider>
          <ThemeProvider>
            <DarkModeSync>
            <LanguageProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="school/[id]"
                  options={{ headerShown: true, headerTitle: "" }}
                />
                <Stack.Screen
                  name="institution/[id]"
                  options={{ headerShown: true, headerTitle: "" }}
                />
                <Stack.Screen
                  name="compare/index"
                  options={{ headerShown: true, headerTitle: "Compare" }}
                />
                <Stack.Screen
                  name="event/[id]"
                  options={{ headerShown: true, headerTitle: "" }}
                />
                <Stack.Screen
                  name="event/create"
                  options={{ headerShown: true, headerTitle: "New Event" }}
                />
              </Stack>
            </LanguageProvider>
            </DarkModeSync>
          </ThemeProvider>
        </DatabaseProvider>
      </SQLiteProvider>
      </Suspense>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
