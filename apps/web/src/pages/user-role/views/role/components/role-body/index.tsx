import React, { useState, useMemo } from 'react';
import { useMemoizedFn } from 'ahooks';
import { Tabs, Tab } from '@mui/material';

import { useI18n } from '@milesight/shared/src/hooks';
import { TabPanel } from '@/components';
import { ROLE_MAIN_TABS } from '../../constants';

import styles from './style.module.less';

/**
 * Role Body
 * About Permissions Choose
 */
const RoleBody: React.FC = () => {
    const { getIntlText } = useI18n();

    const [currentTab, setCurrentTab] = useState(ROLE_MAIN_TABS.MEMBERS);

    const handleTabChange = useMemoizedFn((e: React.SyntheticEvent, newValue: ROLE_MAIN_TABS) => {
        console.log('handleTabChange ?  ', e, newValue);

        setCurrentTab(newValue);
    });

    const roleTabsOptions = useMemo(
        () => [
            {
                label: getIntlText('user.title.role_tab_members'),
                title: getIntlText('user.title.role_tab_members'),
                value: ROLE_MAIN_TABS.MEMBERS,
                content: 'members',
            },
            {
                label: getIntlText('user.title.role_tab_functions'),
                title: getIntlText('user.title.role_tab_functions'),
                value: ROLE_MAIN_TABS.FUNCTIONS,
                content: 'functions',
            },
            {
                label: getIntlText('user.title.role_tab_resources'),
                title: getIntlText('user.title.role_tab_resources'),
                value: ROLE_MAIN_TABS.RESOURCES,
                content: 'resources',
            },
        ],
        [],
    );

    const renderTabs = () => {
        return (
            <>
                <div className={styles['role-body__tabs']}>
                    <Tabs value={currentTab} onChange={handleTabChange}>
                        {roleTabsOptions.map(tab => (
                            <Tab
                                key={tab.value}
                                label={tab.label}
                                title={tab.title}
                                value={tab.value}
                            />
                        ))}
                    </Tabs>
                </div>
                <div className={styles['role-body__tab-panel']}>
                    {roleTabsOptions.map(tab => (
                        <TabPanel key={tab.value} value={currentTab} index={tab.value}>
                            {tab.content}
                        </TabPanel>
                    ))}
                </div>
            </>
        );
    };

    return <div className={styles['role-body']}>{renderTabs()}</div>;
};

export default RoleBody;