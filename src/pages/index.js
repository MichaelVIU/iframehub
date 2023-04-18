import {useState, useEffect} from 'react';
import axios from 'axios';
import {
    Container,
    TextField,
    Button,
    Grid,
    Paper,
    IconButton,
    Typography,
    Box,
    Slider,
    Switch,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';


function WelcomeMessage() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '2rem',
                textAlign: 'center',
            }}
        >
            <Typography variant="h4" component="h1">
                Welcome to Iframe Hub
            </Typography>
            <Typography variant="body1" component="p">
                To get started, enter a URL and click "Add URL" to embed the website
                content in an iframe. Your URLs will be stored in your browser's local
                storage so they will be available when you return to the site.
            </Typography>
        </Box>
    );
}

function IframeContent({ url, iframeSize, useScrapingService, apiKey }) {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (useScrapingService) {
            axios
                .get(
                    `https://api.scrape.do?token=${apiKey}&render=true&url=${encodeURIComponent(
                        url
                    )}`
                )
                .then((response) => {
                    console.log(response)
                    setContent(response.data)})
                .catch((error) => console.error(error));
        } else {
            setContent('');
        }
    }, [url, useScrapingService, apiKey]);

    return (
        <iframe
            src={useScrapingService ? null : url}
            srcDoc={useScrapingService ? content : null}
            title={`iframe-${url}`}
            style={{
                width: '100%',
                height: `${iframeSize}px`,
                border: '1px solid #ccc',
            }}
        />
    );
}

export default function Home() {
    const [url, setUrl] = useState('');
    const [urls, setUrls] = useState([]);
    const [iframeSize, setIframeSize] = useState(300);
    const [scrapingServiceToggles, setScrapingServiceToggles] = useState({});
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const storedUrls = JSON.parse(localStorage.getItem('urls'));
        if (storedUrls) {
            setUrls(storedUrls);
        }

        const storedApiKey = localStorage.getItem('apiKey');
        if (storedApiKey) {
            setApiKey(storedApiKey);
        }

        const storedScrapingServiceToggles = JSON.parse(
            localStorage.getItem('scrapingServiceToggles')
        );
        if (storedScrapingServiceToggles) {
            setScrapingServiceToggles(storedScrapingServiceToggles);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url) {
            const newUrls = [...urls, url];
            setUrls(newUrls);
            localStorage.setItem('urls', JSON.stringify(newUrls));
        }
    };

    const deleteUrl = (index) => {
        const newUrls = urls.filter((_, i) => i !== index);
        setUrls(newUrls);
        localStorage.setItem('urls', JSON.stringify(newUrls));

        // Update the scrapingServiceToggles state
        const newScrapingServiceToggles = {...scrapingServiceToggles};
        delete newScrapingServiceToggles[index];
        setScrapingServiceToggles(newScrapingServiceToggles);
        localStorage.setItem(
            'scrapingServiceToggles',
            JSON.stringify(newScrapingServiceToggles)
        );
    };

    const handleApiKeyChange = (e) => {
        const newApiKey = e.target.value;
        setApiKey(newApiKey);
        localStorage.setItem('apiKey', newApiKey);
    };

    const handleApiKeySave = () => {
        console.log(apiKey)
        localStorage.setItem('apiKey', apiKey);
    };

    const handleScrapingServiceToggle = (index) => {
        setScrapingServiceToggles({
            ...scrapingServiceToggles,
            [index]: !scrapingServiceToggles[index],
        });
        localStorage.setItem(
            'scrapingServiceToggles',
            JSON.stringify(scrapingServiceToggles)
        );
    };

    return (
        <Container maxWidth="lg" sx={{paddingTop: '2rem'}}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={9}>
                        <TextField
                            label="URL"
                            variant="outlined"
                            fullWidth
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="contained" color="primary" type="submit" fullWidth>
                            Add URL
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <Grid container spacing={2} alignItems="center" sx={{ marginTop: '1rem' }}>
                <Grid item xs={1} container alignItems="center" justifyContent="center">
                    <Tooltip title="The API key is used to fetch the content of the websites using the scrape.do API when the toggle is enabled. You can obtain an API key from https://scrape.do">
                        <InfoIcon />
                    </Tooltip>
                </Grid>
                <Grid item xs={8}>
                    <TextField
                        label="API Key"
                        variant="outlined"
                        fullWidth
                        value={apiKey}
                        onChange={handleApiKeyChange}
                    />
                </Grid>
                <Grid item xs={3}>
                    <Button variant="contained" color="primary" onClick={handleApiKeySave} fullWidth>
                        Save API Key
                    </Button>
                </Grid>
            </Grid>

            <Slider
                value={iframeSize}
                min={100}
                max={1000}
                step={10}
                onChange={(_, newValue) => setIframeSize(newValue)}
                valueLabelDisplay="auto"
                sx={{width: '100%', marginTop: '1rem'}}
            />

            <Grid container spacing={2} style={{marginTop: '1rem'}}>
                {urls.length === 0 ? (
                    <WelcomeMessage/>
                ) : (
                    urls.map((url, index) => (
                        <Grid key={index} item xs={12} sm={6} md={6}>
                            <Paper
                                elevation={1}
                                sx={{
                                    padding: '0.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    position: 'relative',
                                }}
                            >
                                <IconButton
                                    onClick={() => deleteUrl(index)}
                                    color="error"
                                    size="small"
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        zIndex: 10,
                                    }}
                                >
                                    <DeleteIcon/>
                                </IconButton>
                                <Switch
                                    checked={scrapingServiceToggles[index] || false}
                                    onChange={() => handleScrapingServiceToggle(index)}
                                    inputProps={{'aria-label': 'Scraping Service Toggle'}}
                                />
                                <IframeContent
                                    url={url}
                                    iframeSize={iframeSize}
                                    useScrapingService={scrapingServiceToggles[index] || false}
                                    apiKey={apiKey}
                                />
                            </Paper>
                        </Grid>
                    ))
                )}
            </Grid>
        </Container>
    );
}
