// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MessageDescriptor} from '@formatjs/intl/src/types';
import React, {useCallback} from 'react';
import {useIntl} from 'react-intl';
import {KeyboardTypeOptions, Platform, TextInputProps, View} from 'react-native';

import FloatingTextInput from '@components/floating_text_input_label';
import {useTheme} from '@context/theme';
import {getKeyboardAppearanceFromTheme, makeStyleSheetFromTheme} from '@utils/theme';

import FieldDescription from './field_description';

type FieldProps = TextInputProps & {
    isDisabled?: boolean;
    fieldDescription?: string;
    key: string;
    keyboardType?: KeyboardTypeOptions;
    label: MessageDescriptor | string;
    maxLength?: number;
    onTextChange: (id: string, value: string) => void;
    isOptional?: boolean;
    testID: string;
    value: string;
};

const Field = ({
    autoCapitalize = 'none',
    autoCorrect = false,
    fieldDescription,
    key,
    isDisabled = false,
    isOptional = false,
    keyboardType = 'default',
    label,
    maxLength,
    onTextChange,
    testID,
    value,
}: FieldProps) => {
    const theme = useTheme();
    const intl = useIntl();

    const onChangeText = useCallback((text: string) => onTextChange(key, text), [key, onTextChange]);

    const style = getStyleSheet(theme);

    const keyboard = (Platform.OS === 'android' && keyboardType === 'url') ? 'default' : keyboardType;

    const labelText = typeof label === 'string' ? label : intl.formatMessage(label);

    const optionalText = isOptional ? intl.formatMessage({
        id: 'channel_modal.optional',
        defaultMessage: '(optional)',
    }) : ' *';

    const formattedLabel = labelText + optionalText;

    return (
        <View
            testID={testID}
            style={style.viewContainer}
        >
            <View style={style.subContainer}>
                <FloatingTextInput
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    disableFullscreenUI={true}
                    editable={!isDisabled}
                    keyboardAppearance={getKeyboardAppearanceFromTheme(theme)}
                    keyboardType={keyboard}
                    label={formattedLabel}
                    maxLength={maxLength}
                    onChangeText={onChangeText}
                    testID={`${testID}.input`}
                    theme={theme}
                    value={value}
                />
                {isDisabled && fieldDescription && (
                    <FieldDescription
                        text={fieldDescription}
                    />
                )}
            </View>
        </View>
    );
};

const getStyleSheet = makeStyleSheetFromTheme(() => {
    return {
        viewContainer: {
            marginVertical: 7,
            alignItems: 'center',
            width: '100%',
        },
        subContainer: {
            width: '84%',
        },
    };
});
export default Field;
