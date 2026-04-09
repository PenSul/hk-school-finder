import { ScrollView, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFilterStore } from "@/stores/useFilterStore";

interface ChipData {
  label: string;
  onRemove: () => void;
}

export function ActiveFilterChips() {
  const districts = useFilterStore((s) => s.districts);
  const financeTypes = useFilterStore((s) => s.financeTypes);
  const religions = useFilterStore((s) => s.religions);
  const sessions = useFilterStore((s) => s.sessions);
  const genders = useFilterStore((s) => s.genders);
  const toggleDistrict = useFilterStore((s) => s.toggleDistrict);
  const toggleFinanceType = useFilterStore((s) => s.toggleFinanceType);
  const toggleReligion = useFilterStore((s) => s.toggleReligion);
  const toggleSession = useFilterStore((s) => s.toggleSession);
  const toggleGender = useFilterStore((s) => s.toggleGender);

  const chips: ChipData[] = [
    ...financeTypes.map((f) => ({ label: f, onRemove: () => toggleFinanceType(f) })),
    ...sessions.map((s) => ({ label: s, onRemove: () => toggleSession(s) })),
    ...genders.map((g) => ({ label: g, onRemove: () => toggleGender(g) })),
    ...districts.map((d) => ({ label: d, onRemove: () => toggleDistrict(d) })),
    ...religions.map((r) => ({ label: r, onRemove: () => toggleReligion(r) })),
  ];

  if (chips.length === 0) return null;

return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }} // Matching your EducationLevelTabs style
      contentContainerStyle={{ alignItems: 'center' }}
      contentContainerClassName="px-4 py-3" // Increased py slightly for the overall container
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.label}
          onPress={chip.onRemove}
          // Changed to py-1.5 and added a subtle border to match the tabs
          className="flex-row items-center bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mr-2"
          accessibilityRole="button"
          accessibilityLabel={`Remove ${chip.label} filter`}
        >
          {/* Changed text-xs to text-sm and added font-medium for consistency */}
          <Text className="text-sm font-medium text-primary mr-2 uppercase tracking-wide">
            {chip.label}
          </Text>
          <Ionicons name="close-circle-sharp" size={14} color="#1E3A5F" />
        </Pressable>
      ))}
    </ScrollView>
  );
}
