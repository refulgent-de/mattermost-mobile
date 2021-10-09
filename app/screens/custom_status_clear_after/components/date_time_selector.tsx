// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Q} from '@nozbe/watermelondb';
import {withDatabase} from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment, {Moment} from 'moment-timezone';
import React, {useState} from 'react';
import {View, Button, Platform} from 'react-native';
import {of as of$} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {Preferences} from '@constants';
import {CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES} from '@constants/custom_status';
import {MM_TABLES} from '@constants/database';
import {getPreferenceAsBool} from '@helpers/api/preference';
import {getCurrentMomentForTimezone, getRoundedTime, getUtcOffsetForTimeZone} from '@utils/helpers';
import {makeStyleSheetFromTheme} from '@utils/theme';
import {getTimezone} from '@utils/user';

import type {WithDatabaseArgs} from '@typings/database/database';
import type PreferenceModel from '@typings/database/models/servers/preference';
import type UserModel from '@typings/database/models/servers/user';

type Props = {
    currentUser: UserModel;
    isMilitaryTime: boolean;
    theme: Theme;
    handleChange: (currentDate: Moment) => void;
}

type AndroidMode = 'date' | 'time';

const getStyleSheet = makeStyleSheetFromTheme((theme: Theme) => {
    return {
        container: {
            flex: 1,
            paddingTop: 10,
            backgroundColor: theme.centerChannelBg,
        },
        buttonContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            marginBottom: 10,
        },
    };
});

const DateTimeSelector = ({currentUser, handleChange, isMilitaryTime, theme}: Props) => {
    const styles = getStyleSheet(theme);
    const timezone = getTimezone(currentUser.timezone);
    const currentTime = getCurrentMomentForTimezone(timezone);
    const timezoneOffSetInMinutes = timezone ? getUtcOffsetForTimeZone(timezone) : undefined;
    const minimumDate = getRoundedTime(currentTime);
    const [date, setDate] = useState<Moment>(minimumDate);
    const [mode, setMode] = useState<AndroidMode>('date');
    const [show, setShow] = useState<boolean>(false);

    const onChange = (_: React.ChangeEvent<HTMLInputElement>, selectedDate: Date) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        if (moment(currentDate).isAfter(minimumDate)) {
            setDate(moment(currentDate));
            handleChange(moment(currentDate));
        }
    };

    const showMode = (currentMode: AndroidMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const showDatepicker = () => {
        showMode('date');
        handleChange(moment(date));
    };

    const showTimepicker = () => {
        showMode('time');
        handleChange(moment(date));
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button
                    testID={'clear_after.menu_item.date_and_time.button.date'}
                    onPress={showDatepicker}
                    title='Select Date'
                    color={theme.buttonBg}
                />
                <Button
                    testID={'clear_after.menu_item.date_and_time.button.time'}
                    onPress={showTimepicker}
                    title='Select Time'
                    color={theme.buttonBg}
                />
            </View>
            {show && (
                <DateTimePicker
                    testID='clear_after.date_time_picker'
                    value={date.toDate()}
                    mode={mode}
                    is24Hour={isMilitaryTime}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChange}
                    textColor={theme.centerChannelColor}
                    minimumDate={minimumDate.toDate()}
                    minuteInterval={CUSTOM_STATUS_TIME_PICKER_INTERVALS_IN_MINUTES}
                    timeZoneOffsetInMinutes={timezoneOffSetInMinutes}
                />
            )}
        </View>
    );
};

const enhanced = withObservables([], ({database}: WithDatabaseArgs) => ({
    isMilitaryTime: database.get<PreferenceModel>(MM_TABLES.SERVER.PREFERENCE).
        query(
            Q.where('category', Preferences.CATEGORY_DISPLAY_SETTINGS),
        ).observe().pipe(
            switchMap(
                (preferences) => of$(getPreferenceAsBool(preferences, Preferences.CATEGORY_DISPLAY_SETTINGS, 'use_military_time', false)),
            ),
        ),
}));

export default withDatabase(enhanced(DateTimeSelector));
