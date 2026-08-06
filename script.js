/**
 * STAGEMIND CENTRAL ENGINE
 * Author: Davies Kubona
 */

// ============================================================
// CONFIGURATION
// ============================================================

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-6';
const API_KEY = 'MY_API_KEY_HERE'; // Replace with my key from console.anthropic.com

// ============================================================
// DEMO MODE
// Set to true for presentations without an API key.
// Set to false once you have a real API key and credits.
// ============================================================
const DEMO_MODE = true;

// ============================================================
// RESPONSE LIMITS
// Free users get 3 analyses per day across all 4 tools.
// Resets at midnight. Set to 0 to disable limits.
// ============================================================
const DAILY_LIMIT      = 3;
const LIMIT_STORAGE_KEY = 'stagemind_usage';

function getUsage() {
    try {
        const stored = JSON.parse(localStorage.getItem(LIMIT_STORAGE_KEY));
        const today  = new Date().toLocaleDateString('en-GB');
        // Reset if it's a new day
        if (!stored || stored.date !== today) {
            return { date: today, count: 0 };
        }
        return stored;
    } catch(e) {
        return { date: new Date().toLocaleDateString('en-GB'), count: 0 };
    }
}

function incrementUsage() {
    const usage = getUsage();
    usage.count += 1;
    localStorage.setItem(LIMIT_STORAGE_KEY, JSON.stringify(usage));
}

function hasReachedLimit() {
    if (DAILY_LIMIT === 0) return false; // Limits disabled
    if (DEMO_MODE) return false;         // No limits in demo mode
    return getUsage().count >= DAILY_LIMIT;
}

function getRemainingUses() {
    if (DAILY_LIMIT === 0) return '∞';
    if (DEMO_MODE) return '∞';
    return Math.max(0, DAILY_LIMIT - getUsage().count);
}

function showLimitMessage(outputIds) {
    const remaining = getRemainingUses();
    outputIds.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
    });
    // Show limit message in the first output section
    const firstEl = document.getElementById(outputIds[0]);
    if (firstEl) {
        firstEl.innerHTML =
            '<div style="text-align:center; padding:30px 20px;">'
            + '<div style="font-size:2rem; margin-bottom:15px;">🎭</div>'
            + '<h3 style="color:#a855f7; margin:0 0 10px 0;">Daily Limit Reached</h3>'
            + '<p style="color:#b3b3b3; line-height:1.6; margin:0 0 20px 0;">'
            + 'You have used all ' + DAILY_LIMIT + ' free analyses for today.<br>'
            + 'Your limit resets at midnight — come back tomorrow to continue!'
            + '</p>'
            + '<p style="color:#554477; font-size:0.85rem; margin:0;">'
            + 'Want unlimited daily analyses? StageMind Premium is coming soon at N$50/month.'
            + '</p>'
            + '</div>';
    }
}

// ============================================================
// DEMO RESPONSES — professional sample content for presentations
// ============================================================
const DEMO_RESPONSES = {
    character: {
        profile:       'Marcus is a 34-year-old former soldier carrying the invisible weight of a war nobody talks about anymore. His physicality is controlled and precise — every movement deliberate, as though the wrong step could trigger something. Beneath his composed exterior lives a man terrified of stillness, because stillness is when the memories come. He has built his identity around being useful to others, making his greatest fear — becoming a burden — the very thing that drives every decision he makes.',
        motivations:   'Marcus is driven by a deep need to protect those he loves before he loses them the way he lost his unit. His goal of opening a youth boxing gym is not about sport — it is about giving troubled young men the structure and purpose that saved his own life. His guilty pleasure of watching old romantic comedies reveals the tender, hopeful version of himself he keeps carefully hidden from the world.',
        relationships: 'Marcus struggles most with his younger sister Diana, who sees through every wall he builds and refuses to let him disappear into isolation. His relationship with his mentor Coach Reeves is the one space where he allows himself to be a student again — vulnerable, learning, imperfect. Romantically, Marcus sabotages connections the moment they deepen, unconsciously protecting others from what he believes is his inevitable breakdown.',
        backstory:     'Raised in a single-parent household after his father left, Marcus became the man of the house at thirteen. Military service gave him belonging and brotherhood, but the mission that ended his career left two teammates dead and Marcus with a classified commendation he cannot bring himself to display. He returned home to a neighbourhood that had moved on without him, forcing him to rebuild an identity from scratch.'
    },
    script: {
        characters:    'Two characters drive this scene — Zack, a charming and wildly overconfident young man whose social intelligence far outpaces his technical knowledge, and Lina, a sharp observant woman who immediately senses the performance but chooses to let it play out. Zack is your classic unreliable expert, performing competence with total commitment. Lina is the audience surrogate — she knows exactly what we know, and her patience is the scenes dramatic engine.',
        relationship:  'These two have the charged dynamic of people who are attracted to each other but expressing it through a battle of wits. Lina holds all the actual power in this scene — she has the information advantage — but she deliberately surrenders it to see how far Zack will go. This is flirtation disguised as technical support, and both actors need to play the subtext harder than the text.',
        conflict:      'The surface conflict is a broken laptop. The real conflict is about ego, attraction, and who will blink first. Zacks objective is to appear capable and impress Lina without being exposed. Linas objective is to enjoy watching him perform while deciding whether his charm is enough to forgive his dishonesty. Neither character wants what they say they want.',
        stakes:        'On the surface the stakes are whether the laptop gets fixed. Underneath, Zack risks total humiliation and the loss of any chance with Lina. Lina risks wasting her time on someone who cannot be honest with her. The scene asks a deeper question — can charm substitute for competence, and should it? The audience should feel genuine tension about whether Lina will expose him or play along.',
        turningPoint:  'The turning point arrives when Zack abandons all pretence of technical knowledge and pivots to pure personality. It is a surrender disguised as a joke. Watch for Linas micro-reaction here — this is where she decides whether to expose him or protect him, and that decision tells us everything about where this relationship is going.',
        choices:       'The most important acting choice is the speed of Zacks recovery after each exposed lie — the faster and more confident, the funnier and more charming he becomes. Lina must resist the urge to play her knowledge too broadly — her power comes from restraint not reaction. Consider playing the entire scene as if both characters know exactly what is happening but have silently agreed to enjoy the game anyway.'
    },
    monologue: {
        difficulty:    'Intermediate — The material requires strong comic timing and physical self-awareness, but the emotional core is straightforward enough for a developing actor to access authentically.',
        objective:     'The characters objective is to convince themselves — not the audience — that their actions are completely reasonable. This is a monologue about self-deception performed with total sincerity, which is where all the comedy lives. The character genuinely believes every justification they offer, and that belief must never waver.',
        journey:       'The monologue opens with defensive pride, moves through elaborate self-justification, hits a brief moment of almost-honesty in the middle, then escapes back into delusion with a warm conclusion. Each beat should feel like a fresh attempt to win an argument the character is having with themselves. The emotional shift from defensiveness to genuine affection in the final line is the secret heart of the piece.',
        vocal:         'The opening lines want a confident almost lecture-like authority — this person has rehearsed these justifications. As the reasoning escalates let the pace increase slightly, as though speed will make the logic more convincing. The middle section deserves a genuine slow-down — a rare moment of almost-honesty before the final escape. The last line should land with real warmth not irony.',
        pauses:        'Take a full beat at each major transition — let the audience feel the gap between intention and reality. The longest pause in the piece belongs just before the final self-description — let the character arrive at that conclusion as if for the first time with genuine pride. Resist filling silences with movement; stillness will make the comedy land harder.',
        tips:          'The biggest trap in comedy monologues is indicating the joke to the audience. Play every line as though you are making a serious reasonable point and let the audience find the humour themselves. Physicality should be minimal but specific — perhaps one gesture the character uses whenever they are about to say something they do not quite believe. Make the imagined space feel physically present by committing to specific spots in the room.'
    },
    scene: {
        intensity:     'This material calls for a sustained medium intensity with controlled peaks — think a 6 out of 10 that occasionally touches 8, never 10. The danger zone for this scene is playing the emotion too large too early, leaving nowhere to go. Begin cooler than you think the scene requires. The restraint in your early choices will make your later moments hit much harder. Pacing here is everything — let the silences do work.',
        voice:         'Your voice should stay grounded in the chest for most of this scene — avoid the tendency to push into the upper register when emotion builds. The pauses you are not taking are your biggest missed opportunities. After a significant line — yours or your scene partners — resist the urge to respond immediately. Let the words land in your body before you speak.',
        body:          'Keep your weight slightly forward throughout this scene — it signals engagement and investment without telegraphing aggression. Eye contact should be specific and intentional not constant. Look away when you are processing not when you are uncomfortable — the distinction tells the audience everything about your characters inner life. Find one specific gesture that belongs to this character and use only that.',
        subtext:       'Almost nothing in this scene means what it literally says and that is where your performance lives. Every line has a want beneath it — find that want and play it instead of the words. The moments when your character is listening are as important as the moments when they speak. Your scene partner is giving you information in every line — let that information visibly land before you respond.',
        alternatives:  'Try the scene once playing your character as someone who desperately wants to leave but cannot. Then try it as someone who desperately wants to stay but will not admit it. Notice how the same lines read completely differently depending on that single underlying choice. A third option — play every line as though it might be the last thing you ever say to this person. That urgency will transform the scenes stakes immediately.'
    }
};

// ============================================================
// SHARED UTILITIES
// ============================================================

function setLoading(id, label) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<span style="opacity:0.5;font-style:italic;">Generating ' + label + '...</span>';
}

function setContent(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text || 'No content generated.';
}

function setError(id, message) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<span style="color:#ff6b6b;">' + message + '</span>';
}

function applyGlowFocus() {
    var elements = Array.prototype.slice.call(arguments);
    elements.forEach(function(el) {
        if (!el) return;
        el.addEventListener('focus', function() { el.style.borderColor = '#00d2ff'; });
        el.addEventListener('blur',  function() { el.style.borderColor = 'rgba(168, 85, 247, 0.3)'; });
    });
}

// Simulates AI with a 2-second delay — used in DEMO_MODE
function callAIDemo(type) {
    return new Promise(function(resolve) {
        setTimeout(function() {
            resolve(DEMO_RESPONSES[type]);
        }, 2000);
    });
}

// Real API call — used when DEMO_MODE = false
async function callAI(prompt) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(function() { return {}; });
        throw new Error(err && err.error && err.error.message ? err.error.message : 'API error ' + response.status);
    }

    const data = await response.json();
    return data.content ? data.content.map(function(b) { return b.text || ''; }).join('\n') : '';
}

function parseStructuredResponse(text, headerMap) {
    const result = {};
    Object.values(headerMap).forEach(function(key) { result[key] = ''; });

    let currentKey = null;
    text.split('\n').forEach(function(rawLine) {
        const line   = rawLine.trim();
        const upper  = line.toUpperCase().replace(/[^A-Z\s&]/g, '').trim();
        const matched = Object.keys(headerMap).find(function(h) { return upper === h; });
        if (matched) {
            currentKey = headerMap[matched];
        } else if (currentKey && line) {
            result[currentKey] += (result[currentKey] ? '\n' : '') + line;
        }
    });
    return result;
}

// ============================================================
// STAGEMIND ENGINE
// ============================================================

const StageMind = {

    // ----------------------------------------------------------
    // 1. CHARACTER BUILDER
    // ----------------------------------------------------------
    characterBuilder: {
        init() {
            const form = document.getElementById('character-form');
            if (!form) return;

            applyGlowFocus.apply(null, Array.from(document.querySelectorAll('input')));

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const name     = document.getElementById('char-name').value.trim();
                const age      = document.getElementById('char-age').value.trim();
                const fear     = document.getElementById('char-fear').value.trim();
                const goal     = document.getElementById('char-goal').value.trim();
                const pleasure = document.getElementById('char-pleasure').value.trim();

                const outputSection = document.getElementById('output-section');
                outputSection.style.display = 'block';
                outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                const outputIds = ['out-profile','out-motivations','out-relationships','out-backstory'];

                if (hasReachedLimit()) {
                    showLimitMessage(outputIds);
                    return;
                }

                setLoading('out-profile',       'character profile');
                setLoading('out-motivations',   'motivations');
                setLoading('out-relationships', 'relationships');
                setLoading('out-backstory',     'backstory');

                try {
                    let sections;
                    if (DEMO_MODE) {
                        sections = await callAIDemo('character');
                    } else {
                        const prompt = 'You are a professional acting coach and dramaturg. Using the character traits below, generate a rich actors breakdown. Use EXACTLY these four section headers on their own lines (no symbols, no markdown, no numbering):\n\nCHARACTER PROFILE\nMOTIVATIONS\nRELATIONSHIPS\nBACKSTORY\n\nCharacter details:\n- Name: ' + name + '\n- Age: ' + age + '\n- Biggest Fear: ' + fear + '\n- Greatest Goal: ' + goal + '\n- Guilty Pleasure: ' + pleasure + '\n\nUnder each header write 3-5 sentences. Be specific, psychologically grounded, and theatrically useful. No bullet points or markdown.';
                        const text = await callAI(prompt);
                        sections = parseStructuredResponse(text, {
                            'CHARACTER PROFILE': 'profile',
                            'MOTIVATIONS':       'motivations',
                            'RELATIONSHIPS':     'relationships',
                            'BACKSTORY':         'backstory'
                        });
                    }
                    setContent('out-profile',       sections.profile);
                    setContent('out-motivations',   sections.motivations);
                    setContent('out-relationships', sections.relationships);
                    setContent('out-backstory',     sections.backstory);
                    incrementUsage();
                    StageMind.trackProgress.autoLog(name || 'Character', 'Character Builder');
                } catch (err) {
                    console.error('Character Builder error:', err);
                    outputIds.forEach(function(id) {
                        setError(id, 'Something went wrong: ' + err.message);
                    });
                }
            });
        }
    },

    // ----------------------------------------------------------
    // 2. SCRIPT BREAKDOWN
    // ----------------------------------------------------------
    scriptBreakdown: {
        init() {
            const form = document.getElementById('breakdown-form');
            if (!form) return;

            applyGlowFocus(document.getElementById('script-input'));

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const script = document.getElementById('script-input').value.trim();

                const outputSection = document.getElementById('breakdown-output');
                outputSection.style.display = 'block';
                outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                const outputIds = ['out-characters','out-relationship','out-conflict','out-stakes','out-turning-point','out-choices'];

                if (hasReachedLimit()) {
                    showLimitMessage(outputIds);
                    return;
                }

                setLoading('out-characters',    'characters');
                setLoading('out-relationship',  'relationship dynamics');
                setLoading('out-conflict',      'scene objective & conflict');
                setLoading('out-stakes',        'stakes');
                setLoading('out-turning-point', 'turning point');
                setLoading('out-choices',       'acting choices');

                try {
                    let sections;
                    if (DEMO_MODE) {
                        sections = await callAIDemo('script');
                    } else {
                        const prompt = 'You are a professional dramaturg and acting coach. Analyze the scene script below. Use EXACTLY these six section headers on their own lines:\n\nCHARACTERS\nRELATIONSHIP\nSCENE OBJECTIVE & CONFLICT\nSTAKES\nTURNING POINT & EMOTIONAL SHIFTS\nIMPORTANT ACTING CHOICES\n\nWrite 3-5 sentences under each. No bullet points or markdown.\n\nSCENE:\n' + script;
                        const text = await callAI(prompt);
                        sections = parseStructuredResponse(text, {
                            'CHARACTERS':                        'characters',
                            'RELATIONSHIP':                      'relationship',
                            'SCENE OBJECTIVE  CONFLICT':         'conflict',
                            'STAKES':                            'stakes',
                            'TURNING POINT  EMOTIONAL SHIFTS':   'turningPoint',
                            'IMPORTANT ACTING CHOICES':          'choices'
                        });
                    }
                    setContent('out-characters',    sections.characters);
                    setContent('out-relationship',  sections.relationship);
                    setContent('out-conflict',      sections.conflict);
                    setContent('out-stakes',        sections.stakes);
                    setContent('out-turning-point', sections.turningPoint);
                    setContent('out-choices',       sections.choices);
                    incrementUsage();
                    StageMind.trackProgress.autoLog('Scene Script', 'Script Breakdown');
                } catch (err) {
                    console.error('Script Breakdown error:', err);
                    outputIds.forEach(function(id) {
                        setError(id, 'Something went wrong: ' + err.message);
                    });
                }
            });
        }
    },

    // ----------------------------------------------------------
    // 3. MONOLOGUE BREAKDOWN
    // ----------------------------------------------------------
    monologueBreakdown: {
        init() {
            const form = document.getElementById('monologue-form');
            if (!form) return;

            applyGlowFocus(document.getElementById('monologue-input'));

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const monologue = document.getElementById('monologue-input').value.trim();

                const outputSection = document.getElementById('monologue-output');
                outputSection.style.display = 'block';
                outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                const outputIds = ['out-difficulty','out-objective','out-journey','out-vocal','out-pauses','out-tips'];

                if (hasReachedLimit()) {
                    showLimitMessage(outputIds);
                    return;
                }

                setLoading('out-difficulty', 'difficulty rating');
                setLoading('out-objective',  'character objective');
                setLoading('out-journey',    'emotional journey');
                setLoading('out-vocal',      'vocal variety suggestions');
                setLoading('out-pauses',     'pause opportunities');
                setLoading('out-tips',       'performance tips');

                try {
                    let sections;
                    if (DEMO_MODE) {
                        sections = await callAIDemo('monologue');
                    } else {
                        const prompt = 'You are a professional acting coach specializing in monologue performance. Analyze the monologue below. Use EXACTLY these six section headers on their own lines:\n\nOVERALL DIFFICULTY\nCHARACTER OBJECTIVE\nEMOTIONAL JOURNEY & BEATS\nVOCAL VARIETY SUGGESTIONS\nPAUSE OPPORTUNITIES\nPERFORMANCE TIPS\n\nFor OVERALL DIFFICULTY respond with Beginner, Intermediate, or Advanced followed by one sentence. Write 3-5 sentences under all other headers. No bullet points or markdown.\n\nMONOLOGUE:\n' + monologue;
                        const text = await callAI(prompt);
                        sections = parseStructuredResponse(text, {
                            'OVERALL DIFFICULTY':        'difficulty',
                            'CHARACTER OBJECTIVE':       'objective',
                            'EMOTIONAL JOURNEY  BEATS':  'journey',
                            'VOCAL VARIETY SUGGESTIONS': 'vocal',
                            'PAUSE OPPORTUNITIES':       'pauses',
                            'PERFORMANCE TIPS':          'tips'
                        });
                    }
                    setContent('out-difficulty', sections.difficulty);
                    setContent('out-objective',  sections.objective);
                    setContent('out-journey',    sections.journey);
                    setContent('out-vocal',      sections.vocal);
                    setContent('out-pauses',     sections.pauses);
                    setContent('out-tips',       sections.tips);
                    incrementUsage();
                    StageMind.trackProgress.autoLog('Monologue', 'Monologue Breakdown');
                } catch (err) {
                    console.error('Monologue Breakdown error:', err);
                    outputIds.forEach(function(id) {
                        setError(id, 'Something went wrong: ' + err.message);
                    });
                }
            });
        }
    },

    // ----------------------------------------------------------
    // 4. SCENE STUDY ASSISTANT
    // ----------------------------------------------------------
    sceneStudy: {
        init() {
            const form = document.getElementById('study-form');
            if (!form) return;

            applyGlowFocus(document.getElementById('study-input'));

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                const input = document.getElementById('study-input').value.trim();

                const outputSection = document.getElementById('study-output');
                outputSection.style.display = 'block';
                outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                const outputIds = ['out-intensity','out-voice','out-body','out-subtext','out-alternatives'];

                if (hasReachedLimit()) {
                    showLimitMessage(outputIds);
                    return;
                }

                setLoading('out-intensity',    'emotional intensity & pacing');
                setLoading('out-voice',        'voice energy & pauses');
                setLoading('out-body',         'body language & eye contact');
                setLoading('out-subtext',      'subtext & listening moments');
                setLoading('out-alternatives', 'alternative acting choices');

                try {
                    let sections;
                    if (DEMO_MODE) {
                        sections = await callAIDemo('scene');
                    } else {
                        const prompt = 'You are an expert acting coach in a one-on-one coaching session. Provide specific coaching guidance. Use EXACTLY these five section headers on their own lines:\n\nEMOTIONAL INTENSITY & PACING\nVOICE ENERGY & PAUSES\nBODY LANGUAGE & EYE CONTACT\nSUBTEXT & LISTENING MOMENTS\nALTERNATIVE ACTING CHOICES\n\nWrite 3-5 sentences under each. Speak directly to the actor. No bullet points or markdown.\n\nACTOR INPUT:\n' + input;
                        const text = await callAI(prompt);
                        sections = parseStructuredResponse(text, {
                            'EMOTIONAL INTENSITY  PACING': 'intensity',
                            'VOICE ENERGY  PAUSES':        'voice',
                            'BODY LANGUAGE  EYE CONTACT':  'body',
                            'SUBTEXT  LISTENING MOMENTS':  'subtext',
                            'ALTERNATIVE ACTING CHOICES':  'alternatives'
                        });
                    }
                    setContent('out-intensity',    sections.intensity);
                    setContent('out-voice',        sections.voice);
                    setContent('out-body',         sections.body);
                    setContent('out-subtext',      sections.subtext);
                    setContent('out-alternatives', sections.alternatives);
                    incrementUsage();
                    StageMind.trackProgress.autoLog('Scene Study Session', 'Scene Study');
                } catch (err) {
                    console.error('Scene Study error:', err);
                    outputIds.forEach(function(id) {
                        setError(id, 'Something went wrong: ' + err.message);
                    });
                }
            });
        }
    },

    // ----------------------------------------------------------
    // 5. FREE LIBRARY (Scripts & Monologues)
    // ----------------------------------------------------------
    freeLibrary: {

        data: {
            scripts: {
                action: [
                    { title: 'Escape From Blacksite Nine',        file: 'scripts/action/Escape From Blacksite Nine.pdf' },
                    { title: 'Last Man Standing',                 file: 'scripts/action/Last Man Standing.pdf' },
                    { title: 'One Minute Left',                   file: 'scripts/action/One Minute Left.pdf' },
                    { title: 'Shadow Protocol',                   file: 'scripts/action/Shadow Protocol.pdf' },
                    { title: 'The Assassin',                      file: 'scripts/action/The Assassin.pdf' },
                    { title: 'The Courier',                       file: 'scripts/action/The Courier.pdf' },
                    { title: 'The Extraction',                    file: 'scripts/action/The Extraction.pdf' },
                    { title: 'The Final Target',                  file: 'scripts/action/The Final Target.pdf' },
                    { title: 'The Rebel Runner',                  file: 'scripts/action/The Rebel Runner.pdf' },
                    { title: 'The Rebel Runner (final dispatch)', file: 'scripts/action/The Rebel Runner(final dispatch).pdf' }
                ],
                comedy: [
                    { title: 'Customer Service Apocalypse',  file: 'scripts/comedy/Customer Service Apocalypse.pdf' },
                    { title: 'The Fake Expert',              file: 'scripts/comedy/The Fake Expert.pdf' },
                    { title: 'The Group Project Survivor',   file: 'scripts/comedy/The Group Project Survivor.pdf' },
                    { title: 'The Overconfident Audition',   file: 'scripts/comedy/The Overconfident Audition.pdf' },
                    { title: 'The Time Traveler Is Late',    file: 'scripts/comedy/The Time Traveler Is Late.pdf' }
                ],
                drama: [
                    { title: 'A Letter Never Sent',       file: 'scripts/drama/A Letter Never Sent.pdf' },
                    { title: 'The Empty Seat',            file: 'scripts/drama/The Empty Seat.pdf' },
                    { title: 'The Final Promise',         file: 'scripts/drama/The Final Promise.pdf' },
                    { title: 'The Last Voicemail',        file: 'scripts/drama/The Last Voicemail.pdf' },
                    { title: 'The Scholarship Interview', file: 'scripts/drama/The Scholarship Interview.pdf' }
                ],
                fantasy: [
                    { title: 'The Kingdom That Forgot Magic', file: 'scripts/fantasy/The Kingdom That Forgot Magic.pdf' },
                    { title: 'The Kingdom',                   file: 'scripts/fantasy/The Kingdom.pdf' },
                    { title: 'The Last Spellkeeper',          file: 'scripts/fantasy/The Last Spellkeeper.pdf' },
                    { title: 'The Monster Hunter',            file: 'scripts/fantasy/The Monster Hunter.pdf' },
                    { title: 'The Sword Beneath the Lake',    file: 'scripts/fantasy/The Sword Beneath the Lake.pdf' }
                ]
            },
            monologues: {
                comedy: [
                    { title: 'Future me has a problem',          file: 'monologues/comedy/Future me has a problem.pdf' },
                    { title: 'My alarm clock and I Are enemies', file: 'monologues/comedy/My arlam clock and I are enemies.pdf' },
                    { title: 'My gym membership is a donation',  file: 'monologues/comedy/My gym membership is a donation.pdf' },
                    { title: 'The customer is never right',      file: 'monologues/comedy/The customer is never right.pdf' },
                    { title: 'The expert',                       file: 'monologues/comedy/The expert.pdf' },
                    { title: 'The group project survivor',       file: 'monologues/comedy/The group project survivor.pdf' },
                    { title: 'The lost remote',                  file: 'monologues/comedy/The lost remote.pdf' },
                    { title: 'The professional procrastinator',  file: 'monologues/comedy/The professional procrastinator.pdf' },
                    { title: 'The wifi funeral',                 file: 'monologues/comedy/The wifi funeral.pdf' },
                    { title: 'The worst first date',             file: 'monologues/comedy/the worst first date.pdf' }
                ],
                drama: [
                    { title: 'Empty chair',            file: 'monologues/drama/Empty chair.pdf' },
                    { title: 'Fathers jacket',         file: 'monologues/drama/Fathers jacket.pdf' },
                    { title: 'Fifteen minutes late',   file: 'monologues/drama/Fifteen minutes late.pdf' },
                    { title: 'One more audition',      file: 'monologues/drama/One more audition.pdf' },
                    { title: 'The bench',              file: 'monologues/drama/The bench.pdf' },
                    { title: 'The call I never made',  file: 'monologues/drama/The call I never made.pdf' },
                    { title: 'The empty stage',        file: 'monologues/drama/The empty stage.pdf' },
                    { title: 'The last voice message', file: 'monologues/drama/The last voice message.pdf' },
                    { title: 'The scholarship letter', file: 'monologues/drama/The scholarship letter.pdf' },
                    { title: 'Tomorrows train',        file: 'monologues/drama/Tomorrows train.pdf' }
                ],
                fantasy: [
                    { title: 'The apprentice who summoned the wrong thing', file: 'monologues/fantasy/The apprentice who summoned the wrong hero.pdf' },
                    { title: 'The dragons customer service call',           file: 'monologues/fantasy/The dragons customer service call.pdf' },
                    { title: 'The innkeeper who serves adventurers only',   file: 'monologues/fantasy/The innkeeper who serves adventurers only.pdf' },
                    { title: 'The knight in hr training',                   file: 'monologues/fantasy/The knight in hr training.pdf' },
                    { title: 'The portion that became self aware 2',        file: 'monologues/fantasy/The portion that became self aware 2.pdf' },
                    { title: 'The potion that became self aware',           file: 'monologues/fantasy/The potion that became self aware.pdf' },
                    { title: 'The prophecy that keeps updating itself',     file: 'monologues/fantasy/The prophecy that keeps updating itself.pdf' },
                    { title: 'The royal guard who cant stop day dreaming',  file: 'monologues/fantasy/The royal guard who cant stop day dreaming.pdf' },
                    { title: 'The time traveler stuck in a tutorial era',   file: 'monologues/fantasy/The time traveler stuck in a tutorial era.pdf' },
                    { title: 'The wizard who forgot his password spell',    file: 'monologues/fantasy/The wizard who forgot his password spell.pdf' }
                ]
            }
        },

        activeDataset: null,
        activeType: '',

        showGenre(genre, btn) {
            document.querySelectorAll('.tab-btn').forEach(function(t) { t.classList.remove('active'); });
            btn.classList.add('active');

            const container  = document.getElementById('scripts-container');
            const list       = this.activeDataset[genre];
            const typeLabel  = this.activeType === 'scripts' ? 'PDF Script' : 'PDF Monologue';
            const genreLabel = genre.charAt(0).toUpperCase() + genre.slice(1);

            let html = '';
            list.forEach(function(s) {
                const safeFile  = s.file.replace(/'/g, "\\'");
                const safeTitle = s.title.replace(/'/g, "\\'");
                html += '<div class="script-card">';
                html += '<div><div class="script-card-title">' + s.title + '</div>';
                html += '<div class="script-card-meta">' + genreLabel + ' &middot; ' + typeLabel + '</div></div>';
                html += '<div class="card-actions">';
                html += '<button class="action-btn btn-view" onclick="StageMind.freeLibrary.openPDF(\'' + safeFile + '\',\'' + safeTitle + '\')">View</button>';
                html += '<a class="action-btn btn-download" href="' + s.file + '" download="' + s.title + '.pdf">Download</a>';
                html += '</div></div>';
            });
            container.innerHTML = html;
        },

        openPDF(file, title) {
            // On mobile, iframes can't display PDFs — open in new tab instead
            if (window.innerWidth <= 768) {
                window.open(file, '_blank');
                return;
            }
            document.getElementById('pdf-frame').src = file;
            document.getElementById('modal-title').innerText = title;
            const dl = document.getElementById('modal-download');
            dl.href = file;
            dl.download = title + '.pdf';
            document.getElementById('pdf-modal').classList.add('open');
            document.body.style.overflow = 'hidden';
        },

        closeModal() {
            document.getElementById('pdf-modal').classList.remove('open');
            document.getElementById('pdf-frame').src = '';
            document.body.style.overflow = '';
        },

        init(type) {
            if (!document.getElementById('scripts-container')) return;
            this.activeType    = type;
            this.activeDataset = this.data[type];
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') StageMind.freeLibrary.closeModal();
            });
            const firstTab = document.querySelector('.tab-btn');
            if (firstTab) firstTab.click();
        }
    },

    // ----------------------------------------------------------
    // 6. TRACK PROGRESS
    // ----------------------------------------------------------
    trackProgress: {
        STORAGE_KEY: 'stagemind_logs',

        getLogs() {
            try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
            catch(e) { return []; }
        },

        saveLogs(logs) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
        },

        autoLog(material, mode) {
            const logs = this.getLogs();
            logs.unshift({
                date:         new Date().toLocaleDateString('en-GB'),
                material:     material || 'Untitled',
                mode:         mode,
                duration:     0,
                memorization: 0,
                status:       'Completed',
                auto:         true
            });
            this.saveLogs(logs);
        },

        renderMetrics(logs) {
            const totalMins = logs.reduce(function(sum, l) { return sum + (Number(l.duration) || 0); }, 0);
            const el = document.getElementById('dash-time');
            if (el) el.innerText = totalMins + ' Mins';

            const withMem = logs.filter(function(l) { return Number(l.memorization) > 0; });
            const avgMem  = withMem.length ? Math.round(withMem.reduce(function(s, l) { return s + Number(l.memorization); }, 0) / withMem.length) : 0;
            const memEl   = document.getElementById('dash-memorization');
            if (memEl) memEl.innerText = avgMem + '% Avg';

            const today = new Date(); today.setHours(0,0,0,0);
            const practiceDays = new Set(logs.map(function(l) {
                const parts = l.date.split('/');
                const d = new Date(parts[2], parts[1]-1, parts[0]);
                d.setHours(0,0,0,0);
                return d.getTime();
            }));
            let streak = 0;
            const check = new Date(today);
            while (practiceDays.has(check.getTime())) {
                streak++;
                check.setDate(check.getDate() - 1);
            }
            const streakEl = document.getElementById('dash-streak');
            if (streakEl) streakEl.innerText = streak + ' Day' + (streak !== 1 ? 's' : '');
        },

        renderTable(logs) {
            const tbody = document.getElementById('progress-table-body');
            if (!tbody) return;

            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="padding:20px 8px; color:#554477; text-align:center;">No rehearsals logged yet. Use a tool or add an entry below.</td></tr>';
                return;
            }

            tbody.innerHTML = logs.map(function(log, i) {
                const statusColor = log.status === 'Completed' ? '#00ffcc' : log.status === 'In Progress' ? '#a855f7' : '#ff5555';
                return '<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">'
                    + '<td style="padding:12px 8px; color:#b3b3b3;">' + log.date + '</td>'
                    + '<td style="padding:12px 8px; color:#ffffff;">' + log.material + '</td>'
                    + '<td style="padding:12px 8px; color:#a855f7;">' + log.mode + '</td>'
                    + '<td style="padding:12px 8px; color:#b3b3b3;">' + log.duration + ' mins</td>'
                    + '<td style="padding:12px 8px;"><span style="color:' + statusColor + '; font-weight:600;">' + log.status + '</span>'
                    + '<button onclick="StageMind.trackProgress.deleteLog(' + i + ')" style="margin-left:10px; background:none; border:none; color:#554477; cursor:pointer; font-size:0.8rem;">x</button></td>'
                    + '</tr>';
            }).join('');
        },

        deleteLog(index) {
            const logs = this.getLogs();
            logs.splice(index, 1);
            this.saveLogs(logs);
            this.render();
        },

        injectForm() {
            const main = document.querySelector('.main-content');
            if (!main || document.getElementById('log-form-section')) return;

            const section = document.createElement('section');
            section.id = 'log-form-section';
            section.className = 'script-section';
            section.style.cssText = 'max-width:800px; width:90%; padding:25px; margin-top:20px;';
            section.innerHTML = '<h3 style="font-size:1.1rem; margin-bottom:15px;"><i class="fa-solid fa-plus" style="color:#00d2ff;"></i> Log a Rehearsal</h3>'
                + '<div style="display:flex; flex-wrap:wrap; gap:12px; align-items:flex-end;">'
                + '<div style="display:flex; flex-direction:column; gap:5px; flex:2; min-width:160px;"><label style="font-size:0.8rem; color:#a855f7; text-transform:uppercase; font-weight:600;">Material / Title</label><input id="log-material" type="text" placeholder="e.g. Hamlet Act 3" style="background:rgba(6,3,12,0.8); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:10px; color:white; outline:none;"></div>'
                + '<div style="display:flex; flex-direction:column; gap:5px; flex:1; min-width:130px;"><label style="font-size:0.8rem; color:#a855f7; text-transform:uppercase; font-weight:600;">Mode</label><select id="log-mode" style="background:rgba(6,3,12,0.8); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:10px; color:white; outline:none;"><option>Character Builder</option><option>Script Breakdown</option><option>Monologue Breakdown</option><option>Scene Study</option><option>Self Practice</option></select></div>'
                + '<div style="display:flex; flex-direction:column; gap:5px; flex:1; min-width:100px;"><label style="font-size:0.8rem; color:#a855f7; text-transform:uppercase; font-weight:600;">Duration (mins)</label><input id="log-duration" type="number" min="1" placeholder="30" style="background:rgba(6,3,12,0.8); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:10px; color:white; outline:none;"></div>'
                + '<div style="display:flex; flex-direction:column; gap:5px; flex:1; min-width:110px;"><label style="font-size:0.8rem; color:#a855f7; text-transform:uppercase; font-weight:600;">Memorization %</label><input id="log-mem" type="number" min="0" max="100" placeholder="75" style="background:rgba(6,3,12,0.8); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:10px; color:white; outline:none;"></div>'
                + '<div style="display:flex; flex-direction:column; gap:5px; flex:1; min-width:120px;"><label style="font-size:0.8rem; color:#a855f7; text-transform:uppercase; font-weight:600;">Status</label><select id="log-status" style="background:rgba(6,3,12,0.8); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:10px; color:white; outline:none;"><option>Completed</option><option>In Progress</option><option>Needs Work</option></select></div>'
                + '<button onclick="StageMind.trackProgress.addManualLog()" class="btn-start" style="padding:10px 24px; border-radius:50px; white-space:nowrap;">+ Add Entry</button>'
                + '</div>';
            main.appendChild(section);

            applyGlowFocus(
                document.getElementById('log-material'),
                document.getElementById('log-duration'),
                document.getElementById('log-mem')
            );
        },

        addManualLog() {
            const material = document.getElementById('log-material').value.trim();
            const mode     = document.getElementById('log-mode').value;
            const duration = parseInt(document.getElementById('log-duration').value) || 0;
            const mem      = parseInt(document.getElementById('log-mem').value) || 0;
            const status   = document.getElementById('log-status').value;

            if (!material) { alert('Please enter a material / title for this rehearsal.'); return; }

            const logs = this.getLogs();
            logs.unshift({ date: new Date().toLocaleDateString('en-GB'), material, mode, duration, memorization: mem, status, auto: false });
            this.saveLogs(logs);

            document.getElementById('log-material').value = '';
            document.getElementById('log-duration').value = '';
            document.getElementById('log-mem').value = '';

            this.render();
        },

        render() {
            const logs = this.getLogs();
            this.renderMetrics(logs);
            this.renderTable(logs);
        },

        init() {
            if (!document.getElementById('progress-table-body')) return;
            this.injectForm();
            this.render();
        }
    },

    // ----------------------------------------------------------
    // PAGE ROUTER
    // ----------------------------------------------------------
    router() {
        const path = window.location.pathname;
        if (path.includes('character-builder'))     this.characterBuilder.init();
        if (path.includes('script-breakdown'))      this.scriptBreakdown.init();
        if (path.includes('monologue-breakdown'))   this.monologueBreakdown.init();
        if (path.includes('scene-study-assistant')) this.sceneStudy.init();
        if (path.includes('free-scripts'))          this.freeLibrary.init('scripts');
        if (path.includes('free-monologues'))       this.freeLibrary.init('monologues');
        if (path.includes('track-progress'))        this.trackProgress.init();
    }
};

// ==========================================================================
// MOBILE SIDEBAR TOGGLE
// ==========================================================================
function initMobileNav() {
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.setAttribute('aria-label', 'Open navigation');
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    document.body.appendChild(hamburger);

    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    const sidebar = document.querySelector('.sidebar');

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function() {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('.nav-item').forEach(function(link) {
        link.addEventListener('click', closeSidebar);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    StageMind.router();
    initMobileNav();
});
