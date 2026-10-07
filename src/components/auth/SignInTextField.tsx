import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authColors } from '../../theme/authColors';

type Props = {
  label: string;
} & TextInputProps;

export default function SignInTextField({ label, style, secureTextEntry = false, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          placeholderTextColor={authColors.textLight}
          style={[styles.input, secureTextEntry && styles.passwordInput, style]}
          secureTextEntry={secureTextEntry && !visible}
          {...inputProps}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.toggle}
            activeOpacity={0.7}
            onPress={() => setVisible((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={authColors.textDark}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: authColors.textDark,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: authColors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: authColors.textDark,
    backgroundColor: authColors.inputBg,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
  },
  toggle: {
    position: 'absolute',
    right: 9,
    width: 36,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
