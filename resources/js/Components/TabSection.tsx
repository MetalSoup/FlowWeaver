import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <div>{children}</div>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function TabSection({tabs, activeTab=0, forceActiveToken}: { tabs: { label: React.ReactNode, content: React.ReactNode }[], activeTab?: number, forceActiveToken?: any }) {
    const [value, setValue] = React.useState(activeTab);

    React.useEffect(() => {
        // Sync internal value with prop when it changes, or when a force token indicates we should re-apply
        if (typeof activeTab === 'number') {
            if (value !== activeTab || (forceActiveToken != null && activeTab === 1)) {
                setValue(activeTab);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, forceActiveToken]);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs">
                    {tabs.map((tab, index) => (
                        <Tab label={tab.label} key={index} {...a11yProps(index)} />
                    ))}
                </Tabs>
            </Box>
            {tabs.map((tab, index) => (
                <CustomTabPanel value={value} index={index} key={index}>
                    {tab.content}
                </CustomTabPanel>
            ))}

        </Box>
    );
}
