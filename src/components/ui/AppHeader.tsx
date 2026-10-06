import { Image, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

interface Props {
  titulo?: string;
}

function HeaderLogo() {
  return (
    <Image
      source={require("../../../assets/images/logo.png")}
      style={styles.headerLogo}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "left",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blanco,
    gap: 10,
    elevation: 2,
  },
  logo: {
    width: 52,
    height: 52,
  },
});
