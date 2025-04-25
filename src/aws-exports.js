const awsmobile = {
    // ... existing config ...
    
    /* Add Storage configuration */
    Storage: {
        AWSS3: {
            bucket: 'ucmsase-website-uploads',
            region: 'us-west-1'
        }
    }
};

export default awsmobile; 