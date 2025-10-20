import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AppTheme, useAppTheme } from '../theme';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthday: '',
    gender: '',
    occupation: '',
    annualIncome: '',
    country: 'US',
    state: '',
    city: '',
    genderCustom: '',
    occupationCustom: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const STEPS = useMemo(
    () => [
      { title: 'Secure Your Account', description: 'Set up credentials so you can sign in safely.' },
      { title: 'Tell Us About You', description: 'Share just enough for accurate benchmarking and insights.' },
      { title: 'Where You Thrive', description: 'Help us tailor location-based comparisons and insights.' },
    ],
    []
  );

  const genderOptions = [
    { key: 'female', label: 'Female' },
    { key: 'male', label: 'Male' },
    { key: 'non_binary', label: 'Non-binary' },
    { key: 'prefer_not', label: 'Prefer not to say' },
    { key: 'custom', label: 'Custom' },
  ] as const;

  const occupationOptions = [
    { key: 'software_engineer', label: 'Software Engineer' },
    { key: 'product_manager', label: 'Product Manager' },
    { key: 'finance', label: 'Finance Professional' },
    { key: 'consultant', label: 'Consultant' },
    { key: 'founder', label: 'Founder / Entrepreneur' },
    { key: 'custom', label: 'Custom' },
  ] as const;

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (currentStep: number) => {
    const stepFieldMap: Record<number, string[]> = {
      0: ['email', 'password', 'confirmPassword'],
      1: ['firstName', 'lastName', 'birthday', 'gender', 'genderCustom'],
      2: ['state', 'city', 'occupation', 'occupationCustom', 'annualIncome'],
    };

    const newErrors: Record<string, string> = {};
    const clearFields = stepFieldMap[currentStep] || [];

    if (currentStep === 0) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (currentStep === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';

      if (!formData.birthday) {
        newErrors.birthday = 'Birthday is required';
      } else {
        const birthdayDate = new Date(formData.birthday);
        const today = new Date();
        const age = today.getFullYear() - birthdayDate.getFullYear();
        const monthDiff = today.getMonth() - birthdayDate.getMonth();

        if (isNaN(birthdayDate.getTime())) {
          newErrors.birthday = 'Use YYYY-MM-DD format (e.g. 1992-08-15)';
        } else if (age < 18 || (age === 18 && monthDiff < 0)) {
          newErrors.birthday = 'You must be at least 18 years old';
        } else if (birthdayDate > today) {
          newErrors.birthday = 'Birthday cannot be in the future';
        }
      }

      if (formData.gender === 'custom' && !formData.genderCustom.trim()) {
        newErrors.genderCustom = 'Please enter your gender';
      }
    }

    if (currentStep === 2) {
      if (!formData.state) newErrors.state = 'State or region is required';
      if (!formData.city) newErrors.city = 'City is required';

      if (formData.occupation === 'custom' && !formData.occupationCustom.trim()) {
        newErrors.occupationCustom = 'Please tell us your role';
      }

      if (formData.annualIncome) {
        const numeric = Number(formData.annualIncome.replace(/[^0-9]/g, ''));
        if (Number.isNaN(numeric) || numeric < 0) {
          newErrors.annualIncome = 'Income must be a positive number';
        }
      }
    }

    setErrors((prev) => {
      const cleaned = { ...prev };
      clearFields.forEach((field) => {
        delete cleaned[field];
      });
      return { ...cleaned, ...newErrors };
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    clearError();

    if (!validateStep(2)) {
      return;
    }

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthday: formData.birthday,
        gender:
          formData.gender === 'custom'
            ? formData.genderCustom.trim() || undefined
            : formData.gender || undefined,
        occupation:
          formData.occupation === 'custom'
            ? formData.occupationCustom.trim() || undefined
            : formData.occupation || undefined,
        annualIncome: formData.annualIncome
          ? parseInt(formData.annualIncome.replace(/[^0-9]/g, ''), 10)
          : undefined,
        country: formData.country,
        state: formData.state,
        city: formData.city,
      };

      await register(registerData);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      Alert.alert('Registration Failed', error || 'Please try again');
    }
  };

  const onNext = () => {
    if (validateStep(step)) {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }
  };

  const onBack = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const renderGenderSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Gender (Optional)</Text>
      <View style={styles.chipRow}>
        {genderOptions.map((option) => {
          const isCustom = option.key === 'custom';
          const active =
            (formData.gender === option.label && !isCustom) ||
            (isCustom && formData.gender === 'custom');

          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                if (isCustom) {
                  updateField('gender', 'custom');
                } else {
                  updateField('gender', option.label);
                  updateField('genderCustom', '');
                }
              }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {formData.gender === 'custom' && (
        <Input
          value={formData.genderCustom}
          onChangeText={(value) => updateField('genderCustom', value)}
          placeholder="Describe your gender"
          autoCapitalize="words"
          error={errors.genderCustom}
        />
      )}
    </View>
  );

  const renderOccupationSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Occupation (Optional)</Text>
      <View style={styles.chipRow}>
        {occupationOptions.map((option) => {
          const isCustom = option.key === 'custom';
          const active =
            (formData.occupation === option.label && !isCustom) ||
            (isCustom && formData.occupation === 'custom');

          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                if (isCustom) {
                  updateField('occupation', 'custom');
                } else {
                  updateField('occupation', option.label);
                  updateField('occupationCustom', '');
                }
              }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {formData.occupation === 'custom' && (
        <Input
          value={formData.occupationCustom}
          onChangeText={(value) => updateField('occupationCustom', value)}
          placeholder="Your role or title"
          autoCapitalize="words"
          error={errors.occupationCustom}
        />
      )}
    </View>
  );

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              placeholder="At least 8 characters"
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              placeholder="Re-enter password"
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirmPassword}
            />
          </>
        );
      case 1:
        return (
          <>
            <View style={styles.privacyCard}>
              <Text style={styles.privacyTitle}>🔐 Your data stays private</Text>
              <Text style={styles.privacyText}>
                We never sell or leak your demographics. They power personalized AI insights and keep
                benchmarking accurate for you alone.
              </Text>
            </View>

            <View style={styles.row}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => updateField('firstName', value)}
                placeholder="Jordan"
                containerStyle={styles.halfInput}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => updateField('lastName', value)}
                placeholder="Smith"
                containerStyle={styles.halfInput}
                error={errors.lastName}
              />
            </View>

            <Input
              label="Birthday (Required)"
              value={formData.birthday}
              onChangeText={(value) => updateField('birthday', value)}
              placeholder="YYYY-MM-DD (e.g., 1993-05-21)"
              keyboardType="default"
              error={errors.birthday}
            />

            {renderGenderSelector()}
          </>
        );
      case 2:
      default:
        return (
          <>
            <View style={styles.privacyCardSecondary}>
              <Text style={styles.privacyTitleSecondary}>🤖 Why we ask</Text>
              <Text style={styles.privacyTextSecondary}>
                Location plus profession sharpen your AI insights, peer comparisons, and trend alerts.
                Nothing leaves our encrypted systems.
              </Text>
            </View>

            {renderOccupationSelector()}

            <Input
              label="Annual Income (Optional)"
              value={formData.annualIncome}
              onChangeText={(value) => updateField('annualIncome', value)}
              placeholder="120000"
              keyboardType="numeric"
              error={errors.annualIncome}
            />

            <View style={styles.row}>
              <Input
                label="State"
                value={formData.state}
                onChangeText={(value) => updateField('state', value)}
                placeholder="CA"
                autoCapitalize="characters"
                containerStyle={styles.halfInput}
                error={errors.state}
              />
              <Input
                label="City"
                value={formData.city}
                onChangeText={(value) => updateField('city', value)}
                placeholder="San Francisco"
                containerStyle={styles.halfInput}
                error={errors.city}
              />
            </View>
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Step {step + 1} of {STEPS.length}
            </Text>
          </View>
          <Text style={styles.title}>{STEPS[step].title}</Text>
          <Text style={styles.subtitle}>{STEPS[step].description}</Text>
        </View>

        <View style={styles.form}>{renderStepContent()}</View>

        <View style={styles.buttonGroup}>
          {step > 0 && (
            <Button title="Back" onPress={onBack} variant="outline" style={styles.backButton} />
          )}

          {step < STEPS.length - 1 ? (
            <Button title="Next" onPress={onNext} style={styles.primaryButton} />
          ) : (
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.primaryButton}
            />
          )}
        </View>

        <Button
          title="Already have an account? Log In"
          onPress={() => router.back()}
          variant="outline"
          style={styles.loginButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 24,
    },
    header: {
      marginTop: 40,
      marginBottom: 32,
      alignItems: 'center',
    },
    stepPill: {
      backgroundColor: theme.colors.accentSoft,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: 12,
    },
    stepPillText: {
      color: theme.colors.accent,
      fontWeight: '600',
      fontSize: 13,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    privacyCard: {
      backgroundColor: theme.colors.surfaceMuted,
      padding: 16,
      borderRadius: 16,
      marginBottom: 24,
    },
    privacyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 6,
    },
    privacyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    privacyCardSecondary: {
      backgroundColor: theme.colors.surfaceElevated,
      padding: 16,
      borderRadius: 16,
      marginBottom: 24,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
    },
    privacyTitleSecondary: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 6,
    },
    privacyTextSecondary: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    form: {
      width: '100%',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    halfInput: {
      flex: 1,
    },
    selectorContainer: {
      marginBottom: 24,
    },
    selectorLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 12,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: theme.colors.chipBackground,
    },
    chipActive: {
      backgroundColor: theme.colors.chipActiveBackground,
    },
    chipText: {
      fontSize: 14,
      color: theme.colors.chipText,
      fontWeight: '600',
    },
    chipTextActive: {
      color: theme.colors.chipActiveText,
    },
    buttonGroup: {
      marginTop: 16,
      flexDirection: 'row',
      gap: 12,
    },
    backButton: {
      flex: 1,
    },
    primaryButton: {
      flex: 2,
    },
    loginButton: {
      marginTop: 12,
      marginBottom: 40,
    },
  });
