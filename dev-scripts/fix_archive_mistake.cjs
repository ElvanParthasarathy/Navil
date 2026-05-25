const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/pages/main/Archive.tsx');
let content = fs.readFileSync(file, 'utf8');

const oldCode = `const Archive = () => {
    const rawArts = artsData;`;

const newCode = `const Archive = () => {
    const [isMounting, setIsMounting] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounting(false), 50);
        return () => clearTimeout(timer);
    }, []);

    const navigate = useNavigate();

    if (isMounting) {
        return <ArchiveSkeleton />;
    }

    // Destructure Data
    // Data from JSON files
    const rawPosts = postsData;
    const rawReels = reelsData;
    const rawArts = artsData;`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(file, content);
console.log('Fixed Archive.tsx mistake!');
