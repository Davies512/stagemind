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
// SUPABASE (accounts + premium subscription status)
// ============================================================
const SUPABASE_URL      = 'https://vtdipeqnhwfnxgstkkmb.supabase.co';
const SUPABASE_ANON_KEY = sb_publishable_3jUrg_-Zna-QN8ZwJB36Rg_OdqStiYm; // from Project Settings > API Keys

const supabaseClient = (window.supabase && SUPABASE_ANON_KEY !== 'PASTE_YOUR_PUBLISHABLE_KEY_HERE')
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Pages that require an active premium subscription to view
const PREMIUM_PAGES = ['ai-scene-partner', 'monologue-mode', 'audition-analyze'];

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
    },
    monologueMode: {
        accuracy:      'You held the shape of the piece well — the words that landed differently from the script were mostly small connector words, which is completely normal and did not disrupt the meaning. One section in the middle drifted further from the text, so it is worth running that passage in isolation a few more times until it is locked in.',
        vocalDelivery: 'Your pacing opened strong with real clarity, though it sped up noticeably in the second half — that usually happens when nerves creep in as the piece builds. Your pitch variety was good on the big moments but flattened out during the quieter transitions, which is exactly where a little more vocal color would help.',
        emotional:     'There was genuine commitment in the last third of the piece — that is where you sounded most connected to the character rather than reciting. Earlier sections felt a touch presentational, like you were performing the emotion rather than living inside it. Trust the stillness more in the opening lines before the intensity needs to rise.',
        nextSteps:     'Run the middle section on its own three times focusing only on staying in the moment, not on getting the words exact. Record yourself again and listen specifically for where your pace speeds up — mark that spot and practice slowing down right there. Finally, try the opening lines seated and quiet before standing into the rest, to find that grounded starting point.'
    },
    auditionPre: {
        focusAreas:       'Anchor your prep on the first ten seconds — casting decides more than people admit before you have said your third line, so walk in already inside the character, not warming up into it. Know your character objective in one sentence you could say out loud if asked. Everything else in the room is secondary to those two things.',
        roomStrategy:      'Treat the reader as your actual scene partner, not an obstacle to get through — real listening reads instantly on camera and in person. Slate simply and confidently, then take a breath before starting; rushing the slate is the most common tell of nerves. If you are offered a redirect, take it as a gift, not a correction.',
        redFlags:          'Avoid indicating emotion with your face before your body and voice have committed to it — it reads as performed rather than felt. Do not apologize or comment on your own take, even lightly; it undercuts the work you just did. Watch for filling every pause with movement — stillness is a choice, not empty space.',
        confidenceAnchor: 'Remind yourself that you were called in because someone already believes you could be right for this — you do not need to prove your existence in the room, only show them your specific choice. Whatever happens with this one, it is one data point, not a verdict on your work.'
    },
    auditionPost: {
        whatWorked:      'From what you have described, your preparation clearly showed — knowing your objective going in gave you something solid to play even under nerves. The moments you mention connecting with the reader are usually the ones casting remembers most, more than any technically perfect line reading.',
        whatToImprove:   'It sounds like the pacing pressure you felt affected your listening in places — that is common and fixable with more redirect practice, not a talent gap. Next time, build in one deliberate breath before your first line so the nerves do not set the tempo for the whole take.',
        callbackRead:    'Based on your account, this reads as a solid, professional audition rather than a clear miss — the kind that keeps you on a casting directors radar even without an immediate callback. Auditions rarely fail on one moment; they add up over a body of work with that room.',
        actionItems:     'Write down the one redirect or note you received while it is fresh, and drill it specifically before your next audition. Log this one in Track Progress with an honest self-rating so you can see your pattern over time, not just this single outing. Then let it go — ruminating on a single room rarely improves the next one.'
    },
    scenePartner: [
        'Wait — say that again. I do not think I heard you right.',
        'You always do this. You say something like that and expect me to just move on.',
        'Fine. If that is how you want to play it, fine.',
        'I was not expecting you to say that. Not tonight, of all nights.',
        'Do not turn this around on me. I came here because I needed to say this.',
        'Maybe you are right. Maybe I have been avoiding this for too long.'
    ]
};

let scenePartnerDemoIndex = 0;

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
            if (type === 'scenePartner') {
                const line = DEMO_RESPONSES.scenePartner[scenePartnerDemoIndex % DEMO_RESPONSES.scenePartner.length];
                scenePartnerDemoIndex++;
                resolve(line);
            } else {
                resolve(DEMO_RESPONSES[type]);
            }
        }, 1200);
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
    // 7. AI SCENE PARTNER (Premium — voice)
    // ----------------------------------------------------------
    scenePartner: {
        recognition: null,
        listening: false,
        script: '',
        yourCharacter: '',
        history: [], // { speaker: 'you'|'partner', text }
        startTime: null,

        getSpeechRecognition() {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            return SR ? new SR() : null;
        },

        init() {
            const form = document.getElementById('partner-setup-form');
            if (!form) return;

            applyGlowFocus(document.getElementById('partner-your-character'));

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                StageMind.scenePartner.beginSession();
            });

            const micBtn = document.getElementById('partner-mic-btn');
            if (micBtn) micBtn.addEventListener('click', function() {
                StageMind.scenePartner.toggleListening();
            });

            const endBtn = document.getElementById('partner-end-btn');
            if (endBtn) endBtn.addEventListener('click', function() {
                StageMind.scenePartner.endSession();
            });
        },

        beginSession() {
            this.script        = document.getElementById('partner-script').value.trim();
            this.yourCharacter = document.getElementById('partner-your-character').value.trim();
            this.history        = [];
            this.startTime       = Date.now();

            if (!this.script || !this.yourCharacter) {
                alert('Please paste a scene and tell StageMind which character you are reading.');
                return;
            }

            document.getElementById('partner-setup').style.display = 'none';
            const session = document.getElementById('partner-session');
            session.style.display = 'block';
            session.scrollIntoView({ behavior: 'smooth', block: 'start' });

            const nameEl = document.getElementById('partner-session-name');
            if (nameEl) nameEl.innerText = 'Reading as: ' + this.yourCharacter;

            this.renderTranscript();
        },

        renderTranscript() {
            const box = document.getElementById('partner-transcript');
            if (!box) return;
            box.innerHTML = this.history.map(function(turn) {
                const cls   = turn.speaker === 'you' ? 'you' : 'partner';
                const label = turn.speaker === 'you' ? 'You' : 'Scene Partner';
                return '<div class="chat-bubble ' + cls + '"><span class="chat-label">' + label + '</span>' + turn.text + '</div>';
            }).join('') || '<div style="color:#554477; text-align:center; padding:20px;">Tap the mic and say your first line to begin.</div>';
            box.scrollTop = box.scrollHeight;
        },

        toggleListening() {
            if (this.listening) { this.stopListening(); return; }

            const recog = this.getSpeechRecognition();
            if (!recog) {
                alert('Voice recognition is not supported in this browser. Try Chrome on desktop or Android.');
                return;
            }
            this.recognition = recog;
            recog.lang = 'en-US';
            recog.interimResults = false;
            recog.maxAlternatives = 1;

            const self = this;
            recog.onresult = function(event) {
                const said = event.results[0][0].transcript;
                self.handleYourLine(said);
            };
            recog.onerror = function() { self.stopListening(); };
            recog.onend = function() { self.stopListening(); };

            recog.start();
            this.listening = true;
            this.setMicUI(true);
        },

        stopListening() {
            if (this.recognition) { try { this.recognition.stop(); } catch(e) {} }
            this.listening = false;
            this.setMicUI(false);
        },

        setMicUI(isListening) {
            const micBtn  = document.getElementById('partner-mic-btn');
            const status  = document.getElementById('partner-mic-status');
            const wave    = document.getElementById('partner-waveform');
            if (micBtn) micBtn.classList.toggle('recording', isListening);
            if (status) { status.innerText = isListening ? 'Listening...' : 'Tap to speak your line'; status.classList.toggle('live', isListening); }
            if (wave)   wave.classList.toggle('idle', !isListening);
        },

        async handleYourLine(text) {
            this.history.push({ speaker: 'you', text: text });
            this.renderTranscript();

            const status = document.getElementById('partner-mic-status');
            if (status) status.innerText = 'Scene partner is responding...';

            try {
                let reply;
                if (DEMO_MODE) {
                    reply = await callAIDemo('scenePartner');
                } else {
                    const context = this.history.map(function(t) {
                        return (t.speaker === 'you' ? this.yourCharacter : 'Scene Partner') + ': ' + t.text;
                    }, this).join('\n');
                    const prompt = 'You are improvising as the OTHER character(s) opposite an actor rehearsing this scene. Stay strictly in character, respond with only the next spoken line (no stage directions, no labels, no quotation marks), keep it natural and under 40 words.\n\nFULL SCENE FOR CONTEXT:\n' + this.script + '\n\nThe human actor is reading the role of: ' + this.yourCharacter + '\n\nCONVERSATION SO FAR:\n' + context + '\n\nRespond now as the scene partner:';
                    reply = await callAI(prompt);
                }
                this.history.push({ speaker: 'partner', text: reply.trim() });
                this.renderTranscript();
                this.speak(reply);
            } catch (err) {
                console.error('Scene Partner error:', err);
                this.history.push({ speaker: 'partner', text: 'Something went wrong reaching the AI scene partner: ' + err.message });
                this.renderTranscript();
            } finally {
                if (status) status.innerText = 'Tap to speak your line';
            }
        },

        speak(text) {
            if (!('speechSynthesis' in window)) return;
            const utter = new SpeechSynthesisUtterance(text);
            utter.rate = 1;
            window.speechSynthesis.speak(utter);
        },

        endSession() {
            this.stopListening();
            const mins = this.startTime ? Math.max(1, Math.round((Date.now() - this.startTime) / 60000)) : 0;
            StageMind.trackProgress.autoLog('AI Scene Partner Rehearsal', 'AI Scene Partner');
            document.getElementById('partner-session').style.display = 'none';
            document.getElementById('partner-setup').style.display = 'block';
            alert('Rehearsal logged (' + mins + ' min) to Track Progress.');
        }
    },

    // ----------------------------------------------------------
    // 8. MONOLOGUE MODE (Premium — voice recording + verbal feedback)
    // ----------------------------------------------------------
    monologueMode: {
        recognition: null,
        listening: false,
        liveTranscript: '',

        getSpeechRecognition() {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            return SR ? new SR() : null;
        },

        init() {
            const btn = document.getElementById('record-btn');
            if (!btn) return;

            btn.addEventListener('click', function() {
                StageMind.monologueMode.toggleRecording();
            });

            const playBtn = document.getElementById('play-feedback-btn');
            if (playBtn) playBtn.addEventListener('click', function() {
                StageMind.monologueMode.playFeedbackAloud();
            });
        },

        toggleRecording() {
            if (this.listening) { this.stopRecording(); return; }

            const recog = this.getSpeechRecognition();
            if (!recog) {
                alert('Voice recognition is not supported in this browser. Try Chrome on desktop or Android.');
                return;
            }
            this.recognition = recog;
            this.liveTranscript = '';
            recog.lang = 'en-US';
            recog.continuous = true;
            recog.interimResults = true;

            const self = this;
            const liveEl = document.getElementById('live-transcript');
            if (liveEl) liveEl.innerText = '';

            recog.onresult = function(event) {
                let finalText = '';
                for (let i = 0; i < event.results.length; i++) {
                    finalText += event.results[i][0].transcript + ' ';
                }
                self.liveTranscript = finalText.trim();
                if (liveEl) liveEl.innerText = self.liveTranscript;
            };
            recog.onerror = function() { self.stopRecording(); };

            recog.start();
            this.listening = true;
            this.setMicUI(true);
        },

        stopRecording() {
            if (this.recognition) { try { this.recognition.stop(); } catch(e) {} }
            this.listening = false;
            this.setMicUI(false);
            if (this.liveTranscript) this.getFeedback();
        },

        setMicUI(isRecording) {
            const btn    = document.getElementById('record-btn');
            const status = document.getElementById('record-status');
            const wave   = document.getElementById('record-waveform');
            if (btn) btn.classList.toggle('recording', isRecording);
            if (status) { status.innerText = isRecording ? 'Recording... tap to stop' : 'Tap to record your performance'; status.classList.toggle('live', isRecording); }
            if (wave) wave.classList.toggle('idle', !isRecording);
        },

        async getFeedback() {
            const outputSection = document.getElementById('mode-output');
            const referenceText = (document.getElementById('monologue-mode-input') || {}).value || '';
            const outputIds = ['out-accuracy', 'out-vocal-delivery', 'out-emotional', 'out-next-steps'];

            outputSection.style.display = 'block';
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (hasReachedLimit()) { showLimitMessage(outputIds); return; }

            outputIds.forEach(function(id) { setLoading(id, 'feedback'); });

            try {
                let sections;
                if (DEMO_MODE) {
                    sections = await callAIDemo('monologueMode');
                } else {
                    const prompt = 'You are a supportive acting coach giving verbal feedback right after a live monologue take. Below is a speech-to-text transcript of what the actor actually said aloud' + (referenceText ? ', alongside the monologue text they intended to perform' : '') + '. Use EXACTLY these four section headers on their own lines:\n\nACCURACY\nVOCAL DELIVERY\nEMOTIONAL COMMITMENT\nNEXT STEPS\n\nWrite as if speaking directly and warmly to the actor, 2-4 sentences each, conversational not clinical.\n\n' + (referenceText ? 'INTENDED MONOLOGUE TEXT:\n' + referenceText + '\n\n' : '') + 'WHAT THE ACTOR ACTUALLY SAID (transcribed):\n' + this.liveTranscript;
                    const text = await callAI(prompt);
                    sections = parseStructuredResponse(text, {
                        'ACCURACY':               'accuracy',
                        'VOCAL DELIVERY':         'vocalDelivery',
                        'EMOTIONAL COMMITMENT':   'emotional',
                        'NEXT STEPS':             'nextSteps'
                    });
                }
                setContent('out-accuracy',        sections.accuracy);
                setContent('out-vocal-delivery',  sections.vocalDelivery);
                setContent('out-emotional',       sections.emotional);
                setContent('out-next-steps',      sections.nextSteps);
                this.lastFeedback = [sections.accuracy, sections.vocalDelivery, sections.emotional, sections.nextSteps].join('. ');
                incrementUsage();
                StageMind.trackProgress.autoLog('Monologue Mode Take', 'Monologue Mode');
            } catch (err) {
                console.error('Monologue Mode error:', err);
                outputIds.forEach(function(id) { setError(id, 'Something went wrong: ' + err.message); });
            }
        },

        playFeedbackAloud() {
            if (!('speechSynthesis' in window) || !this.lastFeedback) return;
            const utter = new SpeechSynthesisUtterance(this.lastFeedback);
            window.speechSynthesis.speak(utter);
        }
    },

    // ----------------------------------------------------------
    // 9. AUDITION ANALYZE (Premium — pre/post audition)
    // ----------------------------------------------------------
    auditionAnalyze: {
        init() {
            const preForm  = document.getElementById('pre-audition-form');
            const postForm = document.getElementById('post-audition-form');
            if (!preForm && !postForm) return;

            if (preForm) preForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await StageMind.auditionAnalyze.runPre();
            });
            if (postForm) postForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await StageMind.auditionAnalyze.runPost();
            });

            const prePlayBtn = document.getElementById('play-pre-feedback-btn');
            if (prePlayBtn) prePlayBtn.addEventListener('click', function() {
                StageMind.auditionAnalyze.playAloud(StageMind.auditionAnalyze.lastPreFeedback);
            });
            const postPlayBtn = document.getElementById('play-post-feedback-btn');
            if (postPlayBtn) postPlayBtn.addEventListener('click', function() {
                StageMind.auditionAnalyze.playAloud(StageMind.auditionAnalyze.lastPostFeedback);
            });

            applyGlowFocus.apply(null, Array.from(document.querySelectorAll('#pre-audition-form input, #pre-audition-form textarea, #post-audition-form textarea')));
        },

        playAloud(text) {
            if (!('speechSynthesis' in window) || !text) return;
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utter);
        },

        showTab(which, btnEl) {
            document.querySelectorAll('#audition-tabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
            if (btnEl) btnEl.classList.add('active');
            document.getElementById('pre-audition-panel').style.display  = which === 'pre'  ? 'block' : 'none';
            document.getElementById('post-audition-panel').style.display = which === 'post' ? 'block' : 'none';
        },

        async runPre() {
            const role  = document.getElementById('pre-role').value.trim();
            const sides = document.getElementById('pre-sides').value.trim();
            const outputIds = ['out-focus-areas', 'out-room-strategy', 'out-red-flags', 'out-confidence-anchor'];

            const outputSection = document.getElementById('pre-output');
            outputSection.style.display = 'block';
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (hasReachedLimit()) { showLimitMessage(outputIds); return; }
            outputIds.forEach(function(id) { setLoading(id, 'pre-audition prep'); });

            try {
                let sections;
                if (DEMO_MODE) {
                    sections = await callAIDemo('auditionPre');
                } else {
                    const prompt = 'You are an audition coach preparing an actor minutes before they go into the room. Use EXACTLY these four section headers on their own lines:\n\nFOCUS AREAS\nROOM STRATEGY\nRED FLAGS TO AVOID\nCONFIDENCE ANCHOR\n\nWrite 2-4 sentences under each, direct and practical.\n\nROLE / CHARACTER:\n' + role + '\n\nSIDES / SCENE:\n' + sides;
                    const text = await callAI(prompt);
                    sections = parseStructuredResponse(text, {
                        'FOCUS AREAS':          'focusAreas',
                        'ROOM STRATEGY':        'roomStrategy',
                        'RED FLAGS TO AVOID':   'redFlags',
                        'CONFIDENCE ANCHOR':    'confidenceAnchor'
                    });
                }
                setContent('out-focus-areas',        sections.focusAreas);
                setContent('out-room-strategy',       sections.roomStrategy);
                setContent('out-red-flags',           sections.redFlags);
                setContent('out-confidence-anchor',   sections.confidenceAnchor);
                this.lastPreFeedback = [sections.focusAreas, sections.roomStrategy, sections.redFlags, sections.confidenceAnchor].join('. ');
                incrementUsage();
                StageMind.trackProgress.autoLog(role || 'Audition Prep', 'Audition Analyze (Pre)');
            } catch (err) {
                console.error('Audition Analyze (pre) error:', err);
                outputIds.forEach(function(id) { setError(id, 'Something went wrong: ' + err.message); });
            }
        },

        async runPost() {
            const summary = document.getElementById('post-summary').value.trim();
            const rating  = document.getElementById('post-rating').value;
            const outputIds = ['out-what-worked', 'out-what-to-improve', 'out-callback-read', 'out-action-items'];

            const outputSection = document.getElementById('post-output');
            outputSection.style.display = 'block';
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (hasReachedLimit()) { showLimitMessage(outputIds); return; }
            outputIds.forEach(function(id) { setLoading(id, 'post-audition analysis'); });

            try {
                let sections;
                if (DEMO_MODE) {
                    sections = await callAIDemo('auditionPost');
                } else {
                    const prompt = 'You are an audition coach helping an actor reflect right after leaving the room. Use EXACTLY these four section headers on their own lines:\n\nWHAT WORKED\nWHAT TO IMPROVE\nCALLBACK READ\nACTION ITEMS\n\nWrite 2-4 sentences under each, honest and encouraging, not empty positivity.\n\nACTOR SELF-RATING (1-5): ' + rating + '\n\nACTOR ACCOUNT OF THE AUDITION:\n' + summary;
                    const text = await callAI(prompt);
                    sections = parseStructuredResponse(text, {
                        'WHAT WORKED':        'whatWorked',
                        'WHAT TO IMPROVE':    'whatToImprove',
                        'CALLBACK READ':      'callbackRead',
                        'ACTION ITEMS':       'actionItems'
                    });
                }
                setContent('out-what-worked',      sections.whatWorked);
                setContent('out-what-to-improve',  sections.whatToImprove);
                setContent('out-callback-read',    sections.callbackRead);
                setContent('out-action-items',     sections.actionItems);
                this.lastPostFeedback = [sections.whatWorked, sections.whatToImprove, sections.callbackRead, sections.actionItems].join('. ');
                incrementUsage();
                StageMind.trackProgress.autoLog('Audition Reflection', 'Audition Analyze (Post)');
            } catch (err) {
                console.error('Audition Analyze (post) error:', err);
                outputIds.forEach(function(id) { setError(id, 'Something went wrong: ' + err.message); });
            }
        }
    },

    // ----------------------------------------------------------
    // ACCOUNTS & PREMIUM ACCESS
    // ----------------------------------------------------------
    auth: {
        currentUser: null,
        isPremium: false,

        async init() {
            this.injectModal();
            await this.refreshSession();

            if (supabaseClient) {
                supabaseClient.auth.onAuthStateChange((event, session) => {
                    this.currentUser = session ? session.user : null;
                    if (this.currentUser) this.checkPremium();
                    this.updateNavUI();
                });
            }
        },

        async refreshSession() {
            if (!supabaseClient) return;
            const { data } = await supabaseClient.auth.getSession();
            this.currentUser = data.session ? data.session.user : null;
            if (this.currentUser) await this.checkPremium();
            this.updateNavUI();
        },

        async checkPremium() {
            if (!supabaseClient || !this.currentUser) { this.isPremium = false; return; }
            const { data } = await supabaseClient
                .from('profiles')
                .select('is_premium')
                .eq('id', this.currentUser.id)
                .single();
            this.isPremium = !!(data && data.is_premium);
        },

        updateNavUI() {
            const link = document.getElementById('subscribe-link');
            if (!link) return;
            if (this.currentUser && this.isPremium) {
                link.innerText = '✦ Premium Active';
                link.style.cursor = 'default';
                link.onclick = function(e) { e.preventDefault(); };
            } else if (this.currentUser) {
                link.innerText = '✦ Upgrade to Premium';
            } else {
                link.innerText = '✦ Subscribe to Premium';
            }
        },

        injectModal() {
            if (document.getElementById('auth-modal')) return;
            const wrap = document.createElement('div');
            wrap.innerHTML =
                '<div id="auth-modal" style="display:none; position:fixed; inset:0; background:rgba(6,3,12,0.85); z-index:9999; align-items:center; justify-content:center; padding:20px;">' +
                    '<div style="background:#110c1c; border:1px solid rgba(168,85,247,0.3); border-radius:16px; padding:30px; width:100%; max-width:380px; box-sizing:border-box;">' +
                        '<h3 id="auth-modal-title" style="margin:0 0 20px 0; text-align:center;">Sign In</h3>' +
                        '<div style="display:flex; flex-direction:column; gap:12px;">' +
                            '<input type="email" id="auth-email" placeholder="Email" style="background:rgba(6,3,12,0.8); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:12px; color:white; outline:none;">' +
                            '<input type="password" id="auth-password" placeholder="Password" style="background:rgba(6,3,12,0.8); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:12px; color:white; outline:none;">' +
                            '<div id="auth-error" style="color:#ff4d6d; font-size:0.85rem; display:none;"></div>' +
                            '<button type="button" class="btn-start" id="auth-submit-btn" style="border-radius:50px; padding:12px;">Sign In</button>' +
                            '<div style="text-align:center; font-size:0.85rem; color:#888aa0; margin-top:8px;">' +
                                '<span id="auth-toggle-text">Need an account?</span> ' +
                                '<a href="#" id="auth-toggle-link" style="color:#00d2ff; text-decoration:none;">Sign Up</a>' +
                            '</div>' +
                            '<button type="button" class="tab-btn" id="auth-close-btn" style="margin-top:6px;">Close</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(wrap.firstChild);

            this.mode = 'signin';
            const self = this;

            document.getElementById('auth-close-btn').addEventListener('click', function() { self.closeModal(); });
            document.getElementById('auth-toggle-link').addEventListener('click', function(e) {
                e.preventDefault();
                self.mode = self.mode === 'signin' ? 'signup' : 'signin';
                document.getElementById('auth-modal-title').innerText = self.mode === 'signin' ? 'Sign In' : 'Create Account';
                document.getElementById('auth-submit-btn').innerText  = self.mode === 'signin' ? 'Sign In' : 'Sign Up';
                document.getElementById('auth-toggle-text').innerText = self.mode === 'signin' ? 'Need an account?' : 'Already have one?';
                e.target.innerText = self.mode === 'signin' ? 'Sign Up' : 'Sign In';
            });
            document.getElementById('auth-submit-btn').addEventListener('click', function() { self.submit(); });
        },

        openModal(e) {
            if (e) e.preventDefault();
            const modal = document.getElementById('auth-modal');
            if (modal) modal.style.display = 'flex';
        },

        closeModal() {
            const modal = document.getElementById('auth-modal');
            if (modal) modal.style.display = 'none';
            const err = document.getElementById('auth-error');
            if (err) err.style.display = 'none';
        },

        async submit() {
            if (!supabaseClient) {
                alert('Supabase is not configured yet — add your Project URL and Publishable key in script.js.');
                return;
            }
            const email    = document.getElementById('auth-email').value.trim();
            const password = document.getElementById('auth-password').value;
            const errBox   = document.getElementById('auth-error');
            errBox.style.display = 'none';

            const action = this.mode === 'signin'
                ? supabaseClient.auth.signInWithPassword({ email, password })
                : supabaseClient.auth.signUp({ email, password });

            const { error } = await action;
            if (error) {
                errBox.innerText = error.message;
                errBox.style.display = 'block';
                return;
            }
            await this.refreshSession();
            this.closeModal();
            location.reload();
        },

        async signOut() {
            if (supabaseClient) await supabaseClient.auth.signOut();
            this.currentUser = null;
            this.isPremium = false;
            location.reload();
        },

        guardPremiumPage() {
            const path = window.location.pathname;
            const isPremiumPage = PREMIUM_PAGES.some(function(p) { return path.includes(p); });
            if (!isPremiumPage) return;

            const gateNow = () => {
                if (this.currentUser && this.isPremium) return;
                const main = document.querySelector('.main-content');
                if (!main || document.getElementById('premium-gate')) return;
                const gate = document.createElement('div');
                gate.id = 'premium-gate';
                gate.style.cssText = 'position:fixed; inset:0; background:rgba(6,3,12,0.92); z-index:500; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px;';
                gate.innerHTML =
                    '<i class="fa-solid fa-lock" style="font-size:2.5rem; color:#a855f7; margin-bottom:20px;"></i>' +
                    '<h2 style="margin:0 0 10px 0;">Premium Feature</h2>' +
                    '<p style="color:#b3b3b3; max-width:400px; margin-bottom:20px;">' + (this.currentUser ? 'Your account is not yet subscribed to Premium.' : 'Sign in and subscribe to unlock this tool.') + '</p>' +
                    '<button type="button" class="btn-start" style="border-radius:50px; padding:12px 30px;" onclick="StageMind.auth.openModal()">' + (this.currentUser ? 'Upgrade to Premium' : 'Sign In / Sign Up') + '</button>';
                document.body.appendChild(gate);
            };

            // Give refreshSession a moment to resolve on first load
            setTimeout(gateNow, 400);
        }
    },

    // ----------------------------------------------------------
    // PAGE ROUTER
    // ----------------------------------------------------------
    async router() {
        await this.auth.init();
        this.auth.guardPremiumPage();

        const path = window.location.pathname;
        if (path.includes('character-builder'))     this.characterBuilder.init();
        if (path.includes('script-breakdown'))      this.scriptBreakdown.init();
        if (path.includes('monologue-breakdown'))   this.monologueBreakdown.init();
        if (path.includes('scene-study-assistant')) this.sceneStudy.init();
        if (path.includes('free-scripts'))          this.freeLibrary.init('scripts');
        if (path.includes('free-monologues'))       this.freeLibrary.init('monologues');
        if (path.includes('track-progress'))        this.trackProgress.init();
        if (path.includes('ai-scene-partner'))       this.scenePartner.init();
        if (path.includes('monologue-mode'))         this.monologueMode.init();
        if (path.includes('audition-analyze'))       this.auditionAnalyze.init();
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
