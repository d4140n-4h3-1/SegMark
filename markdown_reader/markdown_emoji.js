// emoji.js – Complete Emoji Mapping for Markdown (excluding flags)
// Converts :shortcode: to Unicode emoji characters.
// Covers all standard emojis (Unicode 15.0) except flags.
// Categories: Smileys & Emotion, Hand Gestures, People & Body, Activities,
// Objects, Travel & Places, Food & Drink, Nature, Symbols.
// Include this file before your markdown parser and call replaceEmojis(text).

(function() {
    const emojiMap = {

        // ------------------------------------------------------------------
        // Smileys & Emotion
        // ------------------------------------------------------------------
        "100": "💯",
        "alien": "👽",
        "anger": "💢",
        "angry": "😠",
        "anguished": "😧",
        "astonished": "😲",
        "black_heart": "🖤",
        "blush": "😊",
        "boom": "💥",
        "broken_heart": "💔",
        "brown_heart": "🤎",
        "clown_face": "🤡",
        "cold_face": "🥶",
        "cold_sweat": "😰",
        "collision": "💥",
        "confounded": "😖",
        "confused": "😕",
        "cowboy_hat_face": "🤠",
        "cry": "😢",
        "crying_cat_face": "😿",
        "cupid": "💘",
        "cursing_face": "🤬",
        "dash": "💨",
        "disappointed": "😞",
        "disappointed_relieved": "😥",
        "disguised_face": "🥸",
        "dizzy": "💫",
        "dizzy_face": "😵",
        "dotted_line_face": "🫥",
        "drooling_face": "🤤",
        "exploding_head": "🤯",
        "expressionless": "😑",
        "face_exhaling": "😮‍💨",
        "face_holding_back_tears": "🥹",
        "face_in_clouds": "😶‍🌫️",
        "face_with_diagonal_mouth": "🫤",
        "face_with_hand_over_mouth": "🤭",
        "face_with_head_bandage": "🤕",
        "face_with_monocle": "🧐",
        "face_with_open_eyes_and_hand_over_mouth": "🫢",
        "face_with_peeking_eye": "🫣",
        "face_with_raised_eyebrow": "🤨",
        "face_with_spiral_eyes": "😵‍💫",
        "face_with_thermometer": "🤒",
        "fearful": "😨",
        "flushed": "😳",
        "frowning": "😦",
        "frowning_face": "☹️",
        "ghost": "👻",
        "gift_heart": "💝",
        "green_heart": "💚",
        "grey_heart": "🩶",
        "grimacing": "😬",
        "grin": "😁",
        "grinning": "😀",
        "hankey": "💩",
        "heart": "❤️",
        "heart_decoration": "💟",
        "heart_eyes": "😍",
        "heart_eyes_cat": "😻",
        "heart_on_fire": "❤️‍🔥",
        "heartbeat": "💓",
        "heartpulse": "💗",
        "heavy_heart_exclamation": "❣️",
        "hole": "🕳️",
        "hot_face": "🥵",
        "hugging_face": "🤗",
        "hushed": "😯",
        "imp": "👿",
        "innocent": "😇",
        "japanese_goblin": "👺",
        "japanese_ogre": "👹",
        "joy": "😂",
        "joy_cat": "😹",
        "kiss": "💋",
        "kissing": "😗",
        "kissing_cat": "😽",
        "kissing_closed_eyes": "😚",
        "kissing_heart": "😘",
        "kissing_smiling_eyes": "😙",
        "laughing": "😆",
        "left_speech_bubble": "🗨️",
        "light_blue_heart": "🩵",
        "love_letter": "💌",
        "lying_face": "🤥",
        "mask": "😷",
        "melting_face": "🫠",
        "mending_heart": "❤️‍🩹",
        "money_mouth_face": "🤑",
        "nauseated_face": "🤢",
        "nerd_face": "🤓",
        "neutral_face": "😐",
        "no_mouth": "😶",
        "open_mouth": "😮",
        "orange_heart": "🧡",
        "partying_face": "🥳",
        "pensive": "😔",
        "persevere": "😣",
        "pink_heart": "🩷",
        "pleading_face": "🥺",
        "poop": "💩",
        "pouting_cat": "😾",
        "purple_heart": "💜",
        "rage": "😡",
        "relaxed": "☺️",
        "relieved": "😌",
        "revolving_hearts": "💞",
        "right_anger_bubble": "🗯️",
        "robot": "🤖",
        "rofl": "🤣",
        "roll_eyes": "🙄",
        "scream": "😱",
        "scream_cat": "🙀",
        "see_no_evil": "🙈",
        "shaking_face": "🫨",
        "shit": "💩",
        "shushing_face": "🤫",
        "skull": "💀",
        "skull_and_crossbones": "☠️",
        "sleeping": "😴",
        "sleepy": "😪",
        "slightly_frowning_face": "🙁",
        "slightly_smiling_face": "🙂",
        "smile": "😄",
        "smile_cat": "😸",
        "smiley": "😃",
        "smiley_cat": "😺",
        "smiling_face_with_3_hearts": "🥰",
        "smiling_face_with_tear": "🥲",
        "smiling_imp": "😈",
        "smirk": "😏",
        "smirk_cat": "😼",
        "sob": "😭",
        "space_invader": "👾",
        "sparkling_heart": "💖",
        "speak_no_evil": "🙊",
        "speech_balloon": "💬",
        "star_struck": "🤩",
        "stuck_out_tongue": "😛",
        "stuck_out_tongue_closed_eyes": "😝",
        "stuck_out_tongue_winking_eye": "😜",
        "sunglasses": "😎",
        "sweat": "😓",
        "sweat_drops": "💦",
        "sweat_smile": "😅",
        "thinking_face": "🤔",
        "thought_balloon": "💭",
        "tired_face": "😫",
        "triumph": "😤",
        "two_hearts": "💕",
        "unamused": "😒",
        "upside_down_face": "🙃",
        "vomiting_face": "🤮",
        "weary": "😩",
        "white_heart": "🤍",
        "wink": "😉",
        "woozy_face": "🥴",
        "worried": "😟",
        "yawning_face": "🥱",
        "yellow_heart": "💛",
        "yum": "😋",
        "zany_face": "🤪",
        "zipper_mouth_face": "🤐",
        "zzz": "💤",

        // ------------------------------------------------------------------
        // Hand Gestures
        // ------------------------------------------------------------------
        "wave": "👋",
        "raised_back_of_hand": "🤚",
        "raised_hand_with_fingers_splayed": "🖐️",
        "hand": "✋",
        "raised_hand": "✋",
        "vulcan_salute": "🖖",
        "rightwards_hand": "🫱",
        "leftwards_hand": "🫲",
        "palm_down_hand": "🫳",
        "palm_up_hand": "🫴",
        "leftwards_pushing_hand": "🫷",
        "rightwards_pushing_hand": "🫸",
        "ok_hand": "👌",
        "pinched_fingers": "🤌",
        "pinching_hand": "🤏",
        "victory": "✌️",
        "crossed_fingers": "🤞",
        "hand_with_index_finger_and_thumb_crossed": "🫰",
        "love_you_gesture": "🤟",
        "metal": "🤘",
        "call_me_hand": "🤙",
        "point_left": "👈",
        "point_right": "👉",
        "point_up_2": "👆",
        "point_down": "👇",
        "point_up": "☝️",
        "raised_fist": "✊",
        "fist": "👊",
        "punch": "👊",
        "left_facing_fist": "🤛",
        "right_facing_fist": "🤜",
        "clap": "👏",
        "raised_hands": "🙌",
        "heart_hands": "🫶",
        "open_hands": "👐",
        "palms_up_together": "🤲",
        "handshake": "🤝",
        "pray": "🙏",
        "writing_hand": "✍️",
        "nail_care": "💅",
        "selfie": "🤳",
        "muscle": "💪",
        "mechanical_arm": "🦾",
        "mechanical_leg": "🦿",
        "leg": "🦵",
        "foot": "🦶",
        "ear": "👂",
        "ear_with_hearing_aid": "🦻",
        "nose": "👃",
        "brain": "🧠",
        "anatomical_heart": "🫀",
        "lungs": "🫁",
        "tooth": "🦷",
        "bone": "🦴",
        "eyes": "👀",
        "eye": "👁️",
        "tongue": "👅",
        "lips": "👄",
        "biting_lip": "🫦",
        "thumbsup": "👍",
        "thumbsdown": "👎",

        // ------------------------------------------------------------------
        // People & Body (excluding hand gestures)
        // ------------------------------------------------------------------
        "baby": "👶",
        "child": "🧒",
        "boy": "👦",
        "girl": "👧",
        "adult": "🧑",
        "person": "🧑",
        "blond_haired_person": "👱",
        "man": "👨",
        "woman": "👩",
        "older_adult": "🧓",
        "older_man": "👴",
        "older_woman": "👵",
        "person_frowning": "🙍",
        "person_pouting": "🙎",
        "person_gesturing_no": "🙅",
        "person_gesturing_ok": "🙆",
        "person_tipping_hand": "💁",
        "person_raising_hand": "🙋",
        "deaf_person": "🧏",
        "person_bowing": "🙇",
        "person_facepalming": "🤦",
        "person_shrugging": "🤷",
        "health_worker": "🧑‍⚕️",
        "student": "🧑‍🎓",
        "teacher": "🧑‍🏫",
        "judge": "🧑‍⚖️",
        "farmer": "🧑‍🌾",
        "cook": "🧑‍🍳",
        "mechanic": "🧑‍🔧",
        "factory_worker": "🧑‍🏭",
        "office_worker": "🧑‍💼",
        "scientist": "🧑‍🔬",
        "technologist": "🧑‍💻",
        "singer": "🧑‍🎤",
        "artist": "🧑‍🎨",
        "pilot": "🧑‍✈️",
        "astronaut": "🧑‍🚀",
        "firefighter": "🧑‍🚒",
        "people_holding_hands": "🧑‍🤝‍🧑",
        "couple": "👫",
        "two_men_holding_hands": "👬",
        "two_women_holding_hands": "👭",
        "family": "👪",
        "family_man_woman_boy": "👪",
        "family_man_woman_girl": "👪",
        "family_man_woman_girl_boy": "👪",
        "family_man_man_boy": "👨‍👨‍👦",
        "family_man_man_girl": "👨‍👨‍👧",
        "family_man_man_girl_boy": "👨‍👨‍👧‍👦",
        "family_man_man_boy_boy": "👨‍👨‍👦‍👦",
        "family_man_man_girl_girl": "👨‍👨‍👧‍👧",
        "family_woman_woman_boy": "👩‍👩‍👦",
        "family_woman_woman_girl": "👩‍👩‍👧",
        "family_woman_woman_girl_boy": "👩‍👩‍👧‍👦",
        "family_woman_woman_boy_boy": "👩‍👩‍👦‍👦",
        "family_woman_woman_girl_girl": "👩‍👩‍👧‍👧",
        "family_man_boy": "👨‍👦",
        "family_man_boy_boy": "👨‍👦‍👦",
        "family_man_girl": "👨‍👧",
        "family_man_girl_boy": "👨‍👧‍👦",
        "family_man_girl_girl": "👨‍👧‍👧",
        "family_woman_boy": "👩‍👦",
        "family_woman_boy_boy": "👩‍👦‍👦",
        "family_woman_girl": "👩‍👧",
        "family_woman_girl_boy": "👩‍👧‍👦",
        "family_woman_girl_girl": "👩‍👧‍👧",
        "person_bald": "🧑‍🦲",
        "person_curly_hair": "🧑‍🦱",
        "person_red_hair": "🧑‍🦰",
        "person_white_hair": "🧑‍🦳",
        "man_bald": "👨‍🦲",
        "man_curly_hair": "👨‍🦱",
        "man_red_hair": "👨‍🦰",
        "man_white_hair": "👨‍🦳",
        "woman_bald": "👩‍🦲",
        "woman_curly_hair": "👩‍🦱",
        "woman_red_hair": "👩‍🦰",
        "woman_white_hair": "👩‍🦳",
        "person_beard": "🧔",
        "man_beard": "🧔‍♂️",
        "woman_beard": "🧔‍♀️",
        "man_with_chinese_cap": "👲",
        "man_with_turban": "👳",
        "woman_with_turban": "👳‍♀️",
        "man_with_skullcap": "👲",
        "woman_with_headscarf": "🧕",
        "man_in_tuxedo": "🤵",
        "woman_in_tuxedo": "🤵‍♀️",
        "man_with_veil": "👰",
        "woman_with_veil": "👰‍♀️",
        "pregnant_woman": "🤰",
        "breastfeeding": "🤱",
        "woman_feeding_baby": "👩‍🍼",
        "man_feeding_baby": "👨‍🍼",
        "person_feeding_baby": "🧑‍🍼",
        "angel": "👼",
        "santa": "🎅",
        "mrs_claus": "🤶",
        "mx_claus": "🧑‍🎄",
        "superhero": "🦸",
        "supervillain": "🦹",
        "mage": "🧙",
        "fairy": "🧚",
        "vampire": "🧛",
        "merperson": "🧜",
        "elf": "🧝",
        "genie": "🧞",
        "zombie": "🧟",
        "troll": "🧌",
        "person_getting_massage": "💆",
        "person_getting_haircut": "💇",
        "person_walking": "🚶",
        "person_standing": "🧍",
        "person_kneeling": "🧎",
        "person_with_probing_cane": "🧑‍🦯",
        "person_in_motorized_wheelchair": "🧑‍🦼",
        "person_in_manual_wheelchair": "🧑‍🦽",
        "person_running": "🏃",
        "woman_running": "🏃‍♀️",
        "man_running": "🏃‍♂️",
        "dancer": "💃",
        "man_dancing": "🕺",
        "person_in_suit_levitating": "🕴️",
        "people_with_bunny_ears": "👯",
        "person_in_steamy_room": "🧖",
        "person_climbing": "🧗",
        "person_in_lotus_position": "🧘",
        "person_taking_bath": "🛀",
        "person_in_bed": "🛌",
        "people_wrestling": "🤼",
        "person_playing_water_polo": "🤽",
        "person_playing_handball": "🤾",
        "person_juggling": "🤹",

        // ------------------------------------------------------------------
        // Activities
        // ------------------------------------------------------------------
        "badminton": "🏸",
        "baseball": "⚾",
        "basketball": "🏀",
        "bicycle": "🚲",
        "biking": "🚴",
        "black_joker": "🃏",
        "bowling": "🎳",
        "boxing_glove": "🥊",
        "chess_pawn": "♟️",
        "clubs": "♣️",
        "cocktail": "🍸",
        "cricket_game": "🏏",
        "curling_stone": "🥌",
        "dart": "🎯",
        "diamonds": "♦️",
        "diving_mask": "🤿",
        "fencing": "🤺",
        "field_hockey": "🏑",
        "fishing_pole_and_fish": "🎣",
        "flying_disc": "🥏",
        "football": "🏈",
        "game_die": "🎲",
        "goal_net": "🥅",
        "golf": "⛳",
        "guitar": "🎸",
        "handball": "🤾",
        "hearts": "♥️",
        "ice_hockey": "🏒",
        "ice_skate": "⛸️",
        "joystick": "🕹️",
        "kite": "🪁",
        "lacrosse": "🥍",
        "mahjong": "🀄",
        "martial_arts_uniform": "🥋",
        "microphone": "🎤",
        "mountain_biking": "🚵",
        "movie_camera": "🎥",
        "musical_keyboard": "🎹",
        "musical_note": "🎵",
        "musical_score": "🎼",
        "notes": "🎶",
        "parachute": "🪂",
        "performing_arts": "🎭",
        "ping_pong": "🏓",
        "pool_8_ball": "🎱",
        "reminder_ribbon": "🎗️",
        "roller_coaster": "🎢",
        "rowing": "🚣",
        "rugby_football": "🏉",
        "running_shirt_with_sash": "🎽",
        "sailboat": "⛵",
        "saxophone": "🎷",
        "ski": "🎿",
        "sled": "🛷",
        "slot_machine": "🎰",
        "snowboarder": "🏂",
        "soccer": "⚽",
        "softball": "🥎",
        "spades": "♠️",
        "surfer": "🏄",
        "swimmer": "🏊",
        "tennis": "🎾",
        "ticket": "🎫",
        "trophy": "🏆",
        "trumpet": "🎺",
        "video_game": "🎮",
        "violin": "🎻",
        "volleyball": "🏐",
        "weight_lifter": "🏋️",
        "yo_yo": "🪀",

        // ------------------------------------------------------------------
        // Objects
        // ------------------------------------------------------------------
        "mute": "🔇",
        "speaker": "🔈",
        "sound": "🔉",
        "loud_sound": "🔊",
        "loudspeaker": "📢",
        "mega": "📣",
        "postal_horn": "📯",
        "bell": "🔔",
        "no_bell": "🔕",
        "musical_score": "🎼",
        "musical_note": "🎵",
        "notes": "🎶",
        "studio_microphone": "🎙️",
        "level_slider": "🎚️",
        "control_knobs": "🎛️",
        "microphone": "🎤",
        "headphones": "🎧",
        "radio": "📻",
        "saxophone": "🎷",
        "accordion": "🪗",
        "guitar": "🎸",
        "musical_keyboard": "🎹",
        "trumpet": "🎺",
        "violin": "🎻",
        "banjo": "🪕",
        "drum": "🥁",
        "long_drum": "🪘",
        "maracas": "🪇",
        "flute": "🪈",
        "telephone": "☎️",
        "telephone_receiver": "📞",
        "pager": "📟",
        "fax": "📠",
        "battery": "🔋",
        "low_battery": "🪫",
        "electric_plug": "🔌",
        "computer": "💻",
        "desktop_computer": "🖥️",
        "printer": "🖨️",
        "keyboard": "⌨️",
        "computer_mouse": "🖱️",
        "trackball": "🖲️",
        "minidisc": "💽",
        "floppy_disk": "💾",
        "cd": "💿",
        "dvd": "📀",
        "abacus": "🧮",
        "movie_camera": "🎥",
        "film_strip": "🎞️",
        "film_projector": "📽️",
        "clapper": "🎬",
        "tv": "📺",
        "camera": "📷",
        "camera_flash": "📸",
        "video_camera": "📹",
        "videocassette": "📼",
        "mag": "🔍",
        "mag_right": "🔎",
        "candle": "🕯️",
        "bulb": "💡",
        "flashlight": "🔦",
        "izakaya_lantern": "🏮",
        "diya_lamp": "🪔",
        "notebook_with_decorative_cover": "📔",
        "closed_book": "📕",
        "book": "📖",
        "green_book": "📗",
        "blue_book": "📘",
        "orange_book": "📙",
        "books": "📚",
        "notebook": "📓",
        "ledger": "📒",
        "page_with_curl": "📃",
        "scroll": "📜",
        "page_facing_up": "📄",
        "newspaper": "📰",
        "rolled_up_newspaper": "🗞️",
        "bookmark_tabs": "📑",
        "bookmark": "🔖",
        "label": "🏷️",
        "moneybag": "💰",
        "coin": "🪙",
        "yen": "💴",
        "dollar": "💵",
        "euro": "💶",
        "pound": "💷",
        "money_with_wings": "💸",
        "credit_card": "💳",
        "receipt": "🧾",
        "chart": "💹",
        "envelope": "✉️",
        "e-mail": "📧",
        "incoming_envelope": "📨",
        "envelope_with_arrow": "📩",
        "outbox_tray": "📤",
        "inbox_tray": "📥",
        "package": "📦",
        "mailbox": "📫",
        "mailbox_closed": "📪",
        "mailbox_with_mail": "📬",
        "mailbox_with_no_mail": "📭",
        "postbox": "📮",
        "ballot_box": "🗳️",
        "pencil2": "✏️",
        "black_nib": "✒️",
        "fountain_pen": "🖋️",
        "pen": "🖊️",
        "paintbrush": "🖌️",
        "crayon": "🖍️",
        "memo": "📝",
        "briefcase": "💼",
        "file_folder": "📁",
        "open_file_folder": "📂",
        "card_index_dividers": "🗂️",
        "date": "📅",
        "calendar": "📆",
        "spiral_notepad": "🗒️",
        "spiral_calendar": "🗓️",
        "card_index": "📇",
        "chart_with_upwards_trend": "📈",
        "chart_with_downwards_trend": "📉",
        "bar_chart": "📊",
        "clipboard": "📋",
        "pushpin": "📌",
        "round_pushpin": "📍",
        "paperclip": "📎",
        "linked_paperclips": "🖇️",
        "straight_ruler": "📏",
        "triangular_ruler": "📐",
        "scissors": "✂️",
        "card_file_box": "🗃️",
        "file_cabinet": "🗄️",
        "wastebasket": "🗑️",
        "lock": "🔒",
        "unlock": "🔓",
        "lock_with_ink_pen": "🔏",
        "closed_lock_with_key": "🔐",
        "key": "🔑",
        "old_key": "🗝️",
        "hammer": "🔨",
        "axe": "🪓",
        "pick": "⛏️",
        "hammer_and_pick": "⚒️",
        "hammer_and_wrench": "🛠️",
        "dagger": "🗡️",
        "crossed_swords": "⚔️",
        "bomb": "💣",
        "boomerang": "🪃",
        "bow_and_arrow": "🏹",
        "shield": "🛡️",
        "carpentry_saw": "🪚",
        "wrench": "🔧",
        "screwdriver": "🪛",
        "nut_and_bolt": "🔩",
        "gear": "⚙️",
        "clamp": "🗜️",
        "balance_scale": "⚖️",
        "white_cane": "🦯",
        "link": "🔗",
        "chains": "⛓️",
        "hook": "🪝",
        "toolbox": "🧰",
        "magnet": "🧲",
        "ladder": "🪜",
        "alembic": "⚗️",
        "test_tube": "🧪",
        "petri_dish": "🧫",
        "dna": "🧬",
        "microscope": "🔬",
        "telescope": "🔭",
        "satellite_antenna": "📡",
        "syringe": "💉",
        "drop_of_blood": "🩸",
        "pill": "💊",
        "adhesive_bandage": "🩹",
        "crutch": "🩼",
        "stethoscope": "🩺",
        "x_ray": "🩻",
        "door": "🚪",
        "elevator": "🛗",
        "mirror": "🪞",
        "window": "🪟",
        "bed": "🛏️",
        "couch_and_lamp": "🛋️",
        "chair": "🪑",
        "toilet": "🚽",
        "plunger": "🪠",
        "shower": "🚿",
        "bathtub": "🛁",
        "mouse_trap": "🪤",
        "razor": "🪒",
        "lotion_bottle": "🧴",
        "safety_pin": "🧷",
        "broom": "🧹",
        "basket": "🧺",
        "roll_of_paper": "🧻",
        "bucket": "🪣",
        "soap": "🧼",
        "toothbrush": "🪥",
        "sponge": "🧽",
        "fire_extinguisher": "🧯",
        "shopping_cart": "🛒",
        "smoking": "🚬",
        "coffin": "⚰️",
        "headstone": "🪦",
        "funeral_urn": "⚱️",
        "moyai": "🗿",
        "placard": "🪧",
        "identification_card": "🪪",

        // ------------------------------------------------------------------
        // Travel & Places
        // ------------------------------------------------------------------
        "earth_africa": "🌍",
        "earth_americas": "🌎",
        "earth_asia": "🌏",
        "globe_with_meridians": "🌐",
        "world_map": "🗺️",
        "japan": "🗾",
        "compass": "🧭",
        "snow_capped_mountain": "🏔️",
        "mountain": "⛰️",
        "volcano": "🌋",
        "mount_fuji": "🗻",
        "camping": "🏕️",
        "beach_with_umbrella": "🏖️",
        "desert": "🏜️",
        "desert_island": "🏝️",
        "national_park": "🏞️",
        "stadium": "🏟️",
        "classical_building": "🏛️",
        "building_construction": "🏗️",
        "bricks": "🧱",
        "rock": "🪨",
        "wood": "🪵",
        "hut": "🛖",
        "houses": "🏘️",
        "derelict_house": "🏚️",
        "house": "🏠",
        "house_with_garden": "🏡",
        "office": "🏢",
        "post_office": "🏣",
        "european_post_office": "🏤",
        "hospital": "🏥",
        "bank": "🏦",
        "hotel": "🏨",
        "love_hotel": "🏩",
        "convenience_store": "🏪",
        "school": "🏫",
        "department_store": "🏬",
        "factory": "🏭",
        "japanese_castle": "🏯",
        "european_castle": "🏰",
        "wedding": "💒",
        "tokyo_tower": "🗼",
        "statue_of_liberty": "🗽",
        "church": "⛪",
        "mosque": "🕌",
        "hindu_temple": "🛕",
        "synagogue": "🕍",
        "shinto_shrine": "⛩️",
        "kaaba": "🕋",
        "fountain": "⛲",
        "tent": "⛺",
        "foggy": "🌁",
        "night_with_stars": "🌃",
        "cityscape": "🏙️",
        "sunrise_over_mountains": "🌄",
        "sunrise": "🌅",
        "city_sunset": "🌆",
        "city_sunrise": "🌇",
        "bridge_at_night": "🌉",
        "hotsprings": "♨️",
        "carousel_horse": "🎠",
        "playground_slide": "🛝",
        "ferris_wheel": "🎡",
        "roller_coaster": "🎢",
        "barber": "💈",
        "circus_tent": "🎪",
        "steam_locomotive": "🚂",
        "railway_car": "🚃",
        "bullettrain_side": "🚄",
        "bullettrain_front": "🚅",
        "train2": "🚆",
        "metro": "🚇",
        "light_rail": "🚈",
        "station": "🚉",
        "tram": "🚊",
        "monorail": "🚝",
        "mountain_railway": "🚞",
        "train": "🚋",
        "bus": "🚌",
        "oncoming_bus": "🚍",
        "trolleybus": "🚎",
        "minibus": "🚐",
        "ambulance": "🚑",
        "fire_engine": "🚒",
        "police_car": "🚓",
        "oncoming_police_car": "🚔",
        "taxi": "🚕",
        "oncoming_taxi": "🚖",
        "car": "🚗",
        "oncoming_automobile": "🚘",
        "blue_car": "🚙",
        "pickup_truck": "🛻",
        "truck": "🚚",
        "articulated_lorry": "🚛",
        "tractor": "🚜",
        "racing_car": "🏎️",
        "motorcycle": "🏍️",
        "motor_scooter": "🛵",
        "manual_wheelchair": "🦽",
        "motorized_wheelchair": "🦼",
        "auto_rickshaw": "🛺",
        "bike": "🚲",
        "scooter": "🛴",
        "skateboard": "🛹",
        "roller_skate": "🛼",
        "busstop": "🚏",
        "motorway": "🛣️",
        "railway_track": "🛤️",
        "oil_drum": "🛢️",
        "fuelpump": "⛽",
        "wheel": "🛞",
        "rotating_light": "🚨",
        "traffic_light": "🚥",
        "vertical_traffic_light": "🚦",
        "stop_sign": "🛑",
        "construction": "🚧",
        "anchor": "⚓",
        "ring_buoy": "🛟",
        "boat": "⛵",
        "sailboat": "⛵",
        "canoe": "🛶",
        "speedboat": "🚤",
        "passenger_ship": "🛳️",
        "ferry": "⛴️",
        "motor_boat": "🛥️",
        "ship": "🚢",
        "airplane": "✈️",
        "small_airplane": "🛩️",
        "flight_departure": "🛫",
        "flight_arrival": "🛬",
        "parachute": "🪂",
        "seat": "💺",
        "helicopter": "🚁",
        "suspension_railway": "🚟",
        "mountain_cableway": "🚠",
        "aerial_tramway": "🚡",
        "satellite": "🛰️",
        "rocket": "🚀",
        "flying_saucer": "🛸",
        "bellhop_bell": "🛎️",
        "luggage": "🧳",
        "hourglass": "⌛",
        "hourglass_flowing_sand": "⏳",
        "watch": "⌚",
        "alarm_clock": "⏰",
        "stopwatch": "⏱️",
        "timer_clock": "⏲️",
        "mantelpiece_clock": "🕰️",
        "clock12": "🕛",
        "clock1230": "🕧",
        "clock1": "🕐",
        "clock130": "🕜",
        "clock2": "🕑",
        "clock230": "🕝",
        "clock3": "🕒",
        "clock330": "🕞",
        "clock4": "🕓",
        "clock430": "🕟",
        "clock5": "🕔",
        "clock530": "🕠",
        "clock6": "🕕",
        "clock630": "🕡",
        "clock7": "🕖",
        "clock730": "🕢",
        "clock8": "🕗",
        "clock830": "🕣",
        "clock9": "🕘",
        "clock930": "🕤",
        "clock10": "🕙",
        "clock1030": "🕥",
        "clock11": "🕚",
        "clock1130": "🕦",
        "new_moon": "🌑",
        "waxing_crescent_moon": "🌒",
        "first_quarter_moon": "🌓",
        "waxing_gibbous_moon": "🌔",
        "full_moon": "🌕",
        "waning_gibbous_moon": "🌖",
        "last_quarter_moon": "🌗",
        "waning_crescent_moon": "🌘",
        "crescent_moon": "🌙",
        "new_moon_with_face": "🌚",
        "first_quarter_moon_with_face": "🌛",
        "last_quarter_moon_with_face": "🌜",
        "thermometer": "🌡️",
        "sunny": "☀️",
        "full_moon_with_face": "🌝",
        "sun_with_face": "🌞",
        "ringed_planet": "🪐",
        "star": "⭐",
        "star2": "🌟",
        "stars": "🌠",
        "milky_way": "🌌",
        "cloud": "☁️",
        "partly_sunny": "⛅",
        "thunder_cloud_and_rain": "⛈️",
        "mostly_sunny": "🌤️",
        "barely_sunny": "🌥️",
        "partly_sunny_rain": "🌦️",
        "rain_cloud": "🌧️",
        "snow_cloud": "🌨️",
        "lightning": "🌩️",
        "tornado": "🌪️",
        "fog": "🌫️",
        "wind_blowing_face": "🌬️",
        "cyclone": "🌀",
        "rainbow": "🌈",
        "closed_umbrella": "🌂",
        "open_umbrella": "☂️",
        "umbrella_with_rain_drops": "☔",
        "umbrella_on_ground": "⛱️",
        "zap": "⚡",
        "snowflake": "❄️",
        "snowman": "☃️",
        "snowman_without_snow": "⛄",
        "comet": "☄️",
        "fire": "🔥",
        "droplet": "💧",
        "ocean": "🌊",

        // ------------------------------------------------------------------
        // Food & Drink
        // ------------------------------------------------------------------
        "grapes": "🍇",
        "melon": "🍈",
        "watermelon": "🍉",
        "tangerine": "🍊",
        "orange": "🍊",
        "mandarin": "🍊",
        "lemon": "🍋",
        "banana": "🍌",
        "pineapple": "🍍",
        "mango": "🥭",
        "apple": "🍎",
        "green_apple": "🍏",
        "pear": "🍐",
        "peach": "🍑",
        "cherries": "🍒",
        "strawberry": "🍓",
        "blueberries": "🫐",
        "kiwi_fruit": "🥝",
        "tomato": "🍅",
        "olive": "🫒",
        "coconut": "🥥",
        "avocado": "🥑",
        "eggplant": "🍆",
        "potato": "🥔",
        "carrot": "🥕",
        "corn": "🌽",
        "hot_pepper": "🌶️",
        "bell_pepper": "🫑",
        "cucumber": "🥒",
        "leafy_green": "🥬",
        "broccoli": "🥦",
        "garlic": "🧄",
        "onion": "🧅",
        "peanuts": "🥜",
        "beans": "🫘",
        "chestnut": "🌰",
        "ginger_root": "🫚",
        "pea_pod": "🫛",
        "bread": "🍞",
        "croissant": "🥐",
        "baguette_bread": "🥖",
        "flatbread": "🫓",
        "pretzel": "🥨",
        "bagel": "🥯",
        "pancakes": "🥞",
        "waffle": "🧇",
        "cheese": "🧀",
        "meat_on_bone": "🍖",
        "poultry_leg": "🍗",
        "cut_of_meat": "🥩",
        "bacon": "🥓",
        "hamburger": "🍔",
        "fries": "🍟",
        "pizza": "🍕",
        "hotdog": "🌭",
        "sandwich": "🥪",
        "taco": "🌮",
        "burrito": "🌯",
        "tamale": "🫔",
        "stuffed_flatbread": "🥙",
        "falafel": "🧆",
        "egg": "🥚",
        "fried_egg": "🍳",
        "shallow_pan_of_food": "🥘",
        "stew": "🍲",
        "fondue": "🫕",
        "bowl_with_spoon": "🥣",
        "green_salad": "🥗",
        "popcorn": "🍿",
        "butter": "🧈",
        "salt": "🧂",
        "canned_food": "🥫",
        "bento": "🍱",
        "rice_cracker": "🍘",
        "rice_ball": "🍙",
        "rice": "🍚",
        "curry": "🍛",
        "ramen": "🍜",
        "spaghetti": "🍝",
        "sweet_potato": "🍠",
        "oden": "🍢",
        "sushi": "🍣",
        "fried_shrimp": "🍤",
        "fish_cake": "🍥",
        "moon_cake": "🥮",
        "dango": "🍡",
        "dumpling": "🥟",
        "fortune_cookie": "🥠",
        "takeout_box": "🥡",
        "soft_ice_cream": "🍦",
        "shaved_ice": "🍧",
        "ice_cream": "🍨",
        "doughnut": "🍩",
        "cookie": "🍪",
        "birthday": "🎂",
        "cake": "🍰",
        "cupcake": "🧁",
        "pie": "🥧",
        "chocolate_bar": "🍫",
        "candy": "🍬",
        "lollipop": "🍭",
        "custard": "🍮",
        "honey_pot": "🍯",
        "baby_bottle": "🍼",
        "milk_glass": "🥛",
        "coffee": "☕",
        "tea": "🍵",
        "teapot": "🫖",
        "sake": "🍶",
        "champagne": "🍾",
        "wine_glass": "🍷",
        "cocktail": "🍸",
        "tropical_drink": "🍹",
        "beer": "🍺",
        "beers": "🍻",
        "clinking_glasses": "🥂",
        "tumbler_glass": "🥃",
        "pouring_liquid": "🫗",
        "cup_with_straw": "🥤",
        "bubble_tea": "🧋",
        "beverage_box": "🧃",
        "mate": "🧉",
        "ice_cube": "🧊",
        "chopsticks": "🥢",
        "fork_and_knife": "🍴",
        "spoon": "🥄",
        "kitchen_knife": "🔪",
        "jar": "🫙",
        "amphora": "🏺",

        // ------------------------------------------------------------------
        // Nature (animals, plants)
        // ------------------------------------------------------------------
        "monkey": "🐒",
        "monkey_face": "🐵",
        "gorilla": "🦍",
        "orangutan": "🦧",
        "dog": "🐶",
        "dog2": "🐕",
        "guide_dog": "🦮",
        "service_dog": "🐕‍🦺",
        "poodle": "🐩",
        "wolf": "🐺",
        "fox": "🦊",
        "raccoon": "🦝",
        "cat": "🐱",
        "cat2": "🐈",
        "black_cat": "🐈‍⬛",
        "lion": "🦁",
        "tiger": "🐯",
        "tiger2": "🐅",
        "leopard": "🐆",
        "horse": "🐴",
        "racehorse": "🐎",
        "unicorn": "🦄",
        "zebra": "🦓",
        "deer": "🦌",
        "bison": "🦬",
        "cow": "🐮",
        "ox": "🐂",
        "water_buffalo": "🐃",
        "cow2": "🐄",
        "pig": "🐷",
        "pig2": "🐖",
        "boar": "🐗",
        "pig_nose": "🐽",
        "ram": "🐏",
        "sheep": "🐑",
        "goat": "🐐",
        "dromedary_camel": "🐪",
        "camel": "🐫",
        "llama": "🦙",
        "giraffe": "🦒",
        "elephant": "🐘",
        "mammoth": "🦣",
        "rhinoceros": "🦏",
        "hippopotamus": "🦛",
        "mouse": "🐭",
        "mouse2": "🐁",
        "rat": "🐀",
        "hamster": "🐹",
        "rabbit": "🐰",
        "rabbit2": "🐇",
        "chipmunk": "🐿️",
        "beaver": "🦫",
        "hedgehog": "🦔",
        "bat": "🦇",
        "bear": "🐻",
        "polar_bear": "🐻‍❄️",
        "koala": "🐨",
        "panda_face": "🐼",
        "sloth": "🦥",
        "otter": "🦦",
        "skunk": "🦨",
        "kangaroo": "🦘",
        "badger": "🦡",
        "paw_prints": "🐾",
        "turkey": "🦃",
        "chicken": "🐔",
        "rooster": "🐓",
        "hatching_chick": "🐣",
        "baby_chick": "🐤",
        "hatched_chick": "🐥",
        "bird": "🐦",
        "penguin": "🐧",
        "dove": "🕊️",
        "eagle": "🦅",
        "duck": "🦆",
        "swan": "🦢",
        "owl": "🦉",
        "dodo": "🦤",
        "feather": "🪶",
        "flamingo": "🦩",
        "peacock": "🦚",
        "parrot": "🦜",
        "wing": "🪽",
        "black_bird": "🐦‍⬛",
        "goose": "🪿",
        "frog": "🐸",
        "crocodile": "🐊",
        "turtle": "🐢",
        "lizard": "🦎",
        "snake": "🐍",
        "dragon_face": "🐲",
        "dragon": "🐉",
        "sauropod": "🦕",
        "t_rex": "🦖",
        "whale": "🐳",
        "whale2": "🐋",
        "dolphin": "🐬",
        "seal": "🦭",
        "fish": "🐟",
        "tropical_fish": "🐠",
        "blowfish": "🐡",
        "shark": "🦈",
        "octopus": "🐙",
        "shell": "🐚",
        "coral": "🪸",
        "jellyfish": "🪼",
        "snail": "🐌",
        "butterfly": "🦋",
        "bug": "🐛",
        "ant": "🐜",
        "bee": "🐝",
        "beetle": "🪲",
        "ladybug": "🐞",
        "cricket": "🦗",
        "cockroach": "🪳",
        "spider": "🕷️",
        "spider_web": "🕸️",
        "scorpion": "🦂",
        "mosquito": "🦟",
        "fly": "🪰",
        "worm": "🪱",
        "microbe": "🦠",
        "bouquet": "💐",
        "cherry_blossom": "🌸",
        "white_flower": "💮",
        "lotus": "🪷",
        "rosette": "🏵️",
        "rose": "🌹",
        "wilted_flower": "🥀",
        "hibiscus": "🌺",
        "sunflower": "🌻",
        "blossom": "🌼",
        "tulip": "🌷",
        "hyacinth": "🪻",
        "seedling": "🌱",
        "potted_plant": "🪴",
        "evergreen_tree": "🌲",
        "deciduous_tree": "🌳",
        "palm_tree": "🌴",
        "cactus": "🌵",
        "ear_of_rice": "🌾",
        "herb": "🌿",
        "shamrock": "☘️",
        "four_leaf_clover": "🍀",
        "maple_leaf": "🍁",
        "fallen_leaf": "🍂",
        "leaves": "🍃",
        "empty_nest": "🪹",
        "nest_with_eggs": "🪺",
        "mushroom": "🍄",

        // ------------------------------------------------------------------
        // Symbols (geometric, arrows, religion, zodiac, AV, gender, math, punctuation, currency, alphanumeric, keycaps)
        // ------------------------------------------------------------------
        "red_circle": "🔴",
        "orange_circle": "🟠",
        "yellow_circle": "🟡",
        "green_circle": "🟢",
        "blue_circle": "🔵",
        "purple_circle": "🟣",
        "brown_circle": "🟤",
        "black_circle": "⚫",
        "white_circle": "⚪",
        "red_square": "🟥",
        "orange_square": "🟧",
        "yellow_square": "🟨",
        "green_square": "🟩",
        "blue_square": "🟦",
        "purple_square": "🟪",
        "brown_square": "🟫",
        "black_large_square": "⬛",
        "white_large_square": "⬜",
        "black_medium_square": "◼️",
        "white_medium_square": "◻️",
        "black_medium_small_square": "◾",
        "white_medium_small_square": "◽",
        "black_small_square": "▪️",
        "white_small_square": "▫️",
        "large_orange_diamond": "🔶",
        "large_blue_diamond": "🔷",
        "small_orange_diamond": "🔸",
        "small_blue_diamond": "🔹",
        "small_red_triangle": "🔺",
        "small_red_triangle_down": "🔻",
        "diamond_shape_with_a_dot_inside": "💠",
        "radio_button": "🔘",
        "white_square_button": "🔳",
        "black_square_button": "🔲",
        "arrow_up": "⬆️",
        "arrow_up_right": "↗️",
        "arrow_right": "➡️",
        "arrow_down_right": "↘️",
        "arrow_down": "⬇️",
        "arrow_down_left": "↙️",
        "arrow_left": "⬅️",
        "arrow_up_left": "↖️",
        "arrow_up_down": "↕️",
        "left_right_arrow": "↔️",
        "leftwards_arrow_with_hook": "↩️",
        "arrow_right_hook": "↪️",
        "arrow_heading_up": "⤴️",
        "arrow_heading_down": "⤵️",
        "arrows_clockwise": "🔃",
        "arrows_counterclockwise": "🔄",
        "back": "🔙",
        "end": "🔚",
        "on": "🔛",
        "soon": "🔜",
        "top": "🔝",
        "place_of_worship": "🛐",
        "atom_symbol": "⚛️",
        "om": "🕉️",
        "star_of_david": "✡️",
        "wheel_of_dharma": "☸️",
        "yin_yang": "☯️",
        "latin_cross": "✝️",
        "orthodox_cross": "☦️",
        "star_and_crescent": "☪️",
        "peace_symbol": "☮️",
        "menorah": "🕎",
        "six_pointed_star": "🔯",
        "aries": "♈",
        "taurus": "♉",
        "gemini": "♊",
        "cancer": "♋",
        "leo": "♌",
        "virgo": "♍",
        "libra": "♎",
        "scorpius": "♏",
        "sagittarius": "♐",
        "capricorn": "♑",
        "aquarius": "♒",
        "pisces": "♓",
        "ophiuchus": "⛎",
        "twisted_rightwards_arrows": "🔀",
        "repeat": "🔁",
        "repeat_one": "🔂",
        "arrow_forward": "▶️",
        "fast_forward": "⏩",
        "next_track_button": "⏭️",
        "play_pause": "⏯️",
        "arrow_backward": "◀️",
        "rewind": "⏪",
        "previous_track_button": "⏮️",
        "arrow_up_small": "🔼",
        "arrow_double_up": "⏫",
        "arrow_down_small": "🔽",
        "arrow_double_down": "⏬",
        "pause_button": "⏸️",
        "stop_button": "⏹️",
        "record_button": "⏺️",
        "eject_button": "⏏️",
        "cinema": "🎦",
        "low_brightness": "🔅",
        "high_brightness": "🔆",
        "signal_strength": "📶",
        "vibration_mode": "📳",
        "mobile_phone_off": "📴",
        "female_sign": "♀️",
        "male_sign": "♂️",
        "transgender_symbol": "⚧️",
        "heavy_multiplication_x": "✖️",
        "heavy_plus_sign": "➕",
        "heavy_minus_sign": "➖",
        "heavy_division_sign": "➗",
        "infinity": "♾️",
        "bangbang": "‼️",
        "interrobang": "⁉️",
        "question": "❓",
        "grey_question": "❔",
        "grey_exclamation": "❕",
        "exclamation": "❗",
        "wavy_dash": "〰️",
        "currency_exchange": "💱",
        "heavy_dollar_sign": "💲",
        "medical_symbol": "⚕️",
        "recycle": "♻️",
        "fleur_de_lis": "⚜️",
        "trident": "🔱",
        "name_badge": "📛",
        "beginner": "🔰",
        "o": "⭕",
        "white_check_mark": "✅",
        "ballot_box_with_check": "☑️",
        "heavy_check_mark": "✔️",
        "x": "❌",
        "negative_squared_cross_mark": "❎",
        "curly_loop": "➰",
        "loop": "➿",
        "part_alternation_mark": "〽️",
        "eight_spoked_asterisk": "✳️",
        "eight_pointed_black_star": "✴️",
        "sparkle": "❇️",
        "copyright": "©️",
        "registered": "®️",
        "tm": "™️",
        "zero": "0️⃣",
        "one": "1️⃣",
        "two": "2️⃣",
        "three": "3️⃣",
        "four": "4️⃣",
        "five": "5️⃣",
        "six": "6️⃣",
        "seven": "7️⃣",
        "eight": "8️⃣",
        "nine": "9️⃣",
        "keycap_ten": "🔟",
        "capital_abcd": "🔠",
        "abcd": "🔡",
        "1234": "🔢",
        "symbols": "🔣",
        "abc": "🔤",
        "a": "🅰️",
        "ab": "🆎",
        "b": "🅱️",
        "cl": "🆑",
        "cool": "🆒",
        "free": "🆓",
        "information_source": "ℹ️",
        "id": "🆔",
        "m": "Ⓜ️",
        "new": "🆕",
        "ng": "🆖",
        "o2": "🅾️",
        "ok": "🆗",
        "parking": "🅿️",
        "sos": "🆘",
        "up": "🆙",
        "vs": "🆚",
        "koko": "🈁",
        "sa": "🈂️",
        "u6708": "🈷️",
        "u6709": "🈶",
        "u6307": "🈯",
        "ideograph_advantage": "🉐",
        "u5272": "🈹",
        "u7121": "🈚",
        "u7981": "🈲",
        "accept": "🉑",
        "u7533": "🈸",
        "u5408": "🈴",
        "u7a7a": "🈳",
        "congratulations": "㊗️",
        "secret": "㊙️",
        "u55b6": "🈺",
        "u6e80": "🈵",
        "atm": "🏧",
        "put_litter_in_its_place": "🚮",
        "potable_water": "🚰",
        "wheelchair": "♿",
        "mens": "🚹",
        "womens": "🚺",
        "restroom": "🚻",
        "baby_symbol": "🚼",
        "wc": "🚾",
        "passport_control": "🛂",
        "customs": "🛃",
        "baggage_claim": "🛄",
        "left_luggage": "🛅",
        "warning": "⚠️",
        "children_crossing": "🚸",
        "no_entry": "⛔",
        "no_entry_sign": "🚫",
        "no_bicycles": "🚳",
        "no_smoking": "🚭",
        "do_not_litter": "🚯",
        "non_potable_water": "🚱",
        "no_pedestrians": "🚷",
        "no_mobile_phones": "📵",
        "underage": "🔞",
        "radioactive": "☢️",
        "biohazard": "☣️",

        // ------------------------------------------------------------------
        // Africa – Sovereign states and dependent territories
        // ------------------------------------------------------------------
        "flag_dz": "🇩🇿",   // Algeria
        "flag_ao": "🇦🇴",   // Angola
        "flag_bj": "🇧🇯",   // Benin
        "flag_bw": "🇧🇼",   // Botswana
        "flag_bf": "🇧🇫",   // Burkina Faso
        "flag_bi": "🇧🇮",   // Burundi
        "flag_cv": "🇨🇻",   // Cabo Verde
        "flag_cm": "🇨🇲",   // Cameroon
        "flag_cf": "🇨🇫",   // Central African Republic
        "flag_td": "🇹🇩",   // Chad
        "flag_km": "🇰🇲",   // Comoros
        "flag_cg": "🇨🇬",   // Congo (Brazzaville)
        "flag_cd": "🇨🇩",   // Congo (Kinshasa)
        "flag_ci": "🇨🇮",   // Côte d'Ivoire
        "flag_dj": "🇩🇯",   // Djibouti
        "flag_eg": "🇪🇬",   // Egypt
        "flag_gq": "🇬🇶",   // Equatorial Guinea
        "flag_er": "🇪🇷",   // Eritrea
        "flag_sz": "🇸🇿",   // Eswatini (Swaziland)
        "flag_et": "🇪🇹",   // Ethiopia
        "flag_ga": "🇬🇦",   // Gabon
        "flag_gm": "🇬🇲",   // Gambia
        "flag_gh": "🇬🇭",   // Ghana
        "flag_gn": "🇬🇳",   // Guinea
        "flag_gw": "🇬🇼",   // Guinea-Bissau
        "flag_ke": "🇰🇪",   // Kenya
        "flag_ls": "🇱🇸",   // Lesotho
        "flag_lr": "🇱🇷",   // Liberia
        "flag_ly": "🇱🇾",   // Libya
        "flag_mg": "🇲🇬",   // Madagascar
        "flag_mw": "🇲🇼",   // Malawi
        "flag_ml": "🇲🇱",   // Mali
        "flag_mr": "🇲🇷",   // Mauritania
        "flag_mu": "🇲🇺",   // Mauritius
        "flag_ma": "🇲🇦",   // Morocco
        "flag_mz": "🇲🇿",   // Mozambique
        "flag_na": "🇳🇦",   // Namibia
        "flag_ne": "🇳🇪",   // Niger
        "flag_ng": "🇳🇬",   // Nigeria
        "flag_rw": "🇷🇼",   // Rwanda
        "flag_st": "🇸🇹",   // São Tomé and Príncipe
        "flag_sn": "🇸🇳",   // Senegal
        "flag_sc": "🇸🇨",   // Seychelles
        "flag_sl": "🇸🇱",   // Sierra Leone
        "flag_so": "🇸🇴",   // Somalia
        "flag_za": "🇿🇦",   // South Africa
        "flag_ss": "🇸🇸",   // South Sudan
        "flag_sd": "🇸🇩",   // Sudan
        "flag_tz": "🇹🇿",   // Tanzania
        "flag_tg": "🇹🇬",   // Togo
        "flag_tn": "🇹🇳",   // Tunisia
        "flag_ug": "🇺🇬",   // Uganda
        "flag_zm": "🇿🇲",   // Zambia
        "flag_zw": "🇿🇼",   // Zimbabwe

        // African islands and territories with their own flags
        "flag_yt": "🇾🇹",   // Mayotte (French overseas department)
        "flag_re": "🇷🇪",   // Réunion (French overseas department)
        "flag_sh": "🇸🇭",   // Saint Helena, Ascension and Tristan da Cunha (British Overseas Territory)
        "flag_eh": "🇪🇭",    // Western Sahara (disputed territory)

        // ------------------------------------------------------------------
        // Asia – Sovereign states (UN members)
        // ------------------------------------------------------------------
        "flag_af": "🇦🇫",   // Afghanistan
        "flag_am": "🇦🇲",   // Armenia
        "flag_az": "🇦🇿",   // Azerbaijan
        "flag_bh": "🇧🇭",   // Bahrain
        "flag_bd": "🇧🇩",   // Bangladesh
        "flag_bt": "🇧🇹",   // Bhutan
        "flag_bn": "🇧🇳",   // Brunei
        "flag_kh": "🇰🇭",   // Cambodia
        "flag_cn": "🇨🇳",   // China
        "flag_cy": "🇨🇾",   // Cyprus
        "flag_tl": "🇹🇱",   // Timor-Leste (East Timor)
        "flag_ge": "🇬🇪",   // Georgia
        "flag_hk": "🇭🇰", // Hong Kong
        "flag_in": "🇮🇳",   // India
        "flag_id": "🇮🇩",   // Indonesia
        "flag_ir": "🇮🇷",   // Iran
        "flag_iq": "🇮🇶",   // Iraq
        "flag_il": "🇮🇱",   // Israel
        "flag_jp": "🇯🇵",   // Japan
        "flag_jo": "🇯🇴",   // Jordan
        "flag_kz": "🇰🇿",   // Kazakhstan
        "flag_kp": "🇰🇵",   // North Korea
        "flag_kr": "🇰🇷",   // South Korea
        "flag_kw": "🇰🇼",   // Kuwait
        "flag_kg": "🇰🇬",   // Kyrgyzstan
        "flag_la": "🇱🇦",   // Laos
        "flag_lb": "🇱🇧",   // Lebanon
        "flag_mo": "🇲🇴",   // Macao
        "flag_my": "🇲🇾",   // Malaysia
        "flag_mv": "🇲🇻",   // Maldives
        "flag_mn": "🇲🇳",   // Mongolia
        "flag_mm": "🇲🇲",   // Myanmar
        "flag_np": "🇳🇵",   // Nepal
        "flag_om": "🇴🇲",   // Oman
        "flag_pk": "🇵🇰",   // Pakistan
        "flag_ph": "🇵🇭",   // Philippines
        "flag_qa": "🇶🇦",   // Qatar
        "flag_ru": "🇷🇺",   // Russia
        "flag_sa": "🇸🇦",   // Saudi Arabia
        "flag_sg": "🇸🇬",   // Singapore
        "flag_lk": "🇱🇰",   // Sri Lanka
        "flag_sy": "🇸🇾",   // Syria
        "flag_tw": "🇹🇼", // Taiwan
        "flag_tj": "🇹🇯",   // Tajikistan
        "flag_th": "🇹🇭",   // Thailand
        "flag_tr": "🇹🇷",   // Turkey
        "flag_tm": "🇹🇲",   // Turkmenistan
        "flag_ae": "🇦🇪",   // United Arab Emirates
        "flag_uz": "🇺🇿",   // Uzbekistan
        "flag_vn": "🇻🇳",   // Vietnam
        "flag_ye": "🇾🇪",   // Yemen

        // ------------------------------------------------------------------
        // UN Observer State
        // ------------------------------------------------------------------
        "flag_ps": "🇵🇸",   // State of Palestine

        // ------------------------------------------------------------------
        // Europe
        // ------------------------------------------------------------------
        "flag_al": "🇦🇱",   // Albania
        "flag_ad": "🇦🇩",   // Andorra
        "flag_am": "🇦🇲",   // Armenia
        "flag_at": "🇦🇹",   // Austria
        "flag_az": "🇦🇿",   // Azerbaijan
        "flag_by": "🇧🇾",   // Belarus
        "flag_be": "🇧🇪",   // Belgium
        "flag_ba": "🇧🇦",   // Bosnia and Herzegovina
        "flag_bg": "🇧🇬",   // Bulgaria
        "flag_hr": "🇭🇷",   // Croatia
        "flag_cy": "🇨🇾",   // Cyprus
        "flag_cz": "🇨🇿",   // Czech Republic
        "flag_dk": "🇩🇰",   // Denmark
        "flag_ee": "🇪🇪",   // Estonia
        "flag_fi": "🇫🇮",   // Finland
        "flag_fr": "🇫🇷",   // France
        "flag_ge": "🇬🇪",   // Georgia
        "flag_de": "🇩🇪",   // Germany
        "flag_gr": "🇬🇷",   // Greece
        "flag_hu": "🇭🇺",   // Hungary
        "flag_is": "🇮🇸",   // Iceland
        "flag_ie": "🇮🇪",   // Ireland
        "flag_it": "🇮🇹",   // Italy
        "flag_kz": "🇰🇿",   // Kazakhstan
        "flag_xk": "🇽🇰",   // Kosovo
        "flag_lv": "🇱🇻",   // Latvia
        "flag_li": "🇱🇮",   // Liechtenstein
        "flag_lt": "🇱🇹",   // Lithuania
        "flag_lu": "🇱🇺",   // Luxembourg
        "flag_mt": "🇲🇹",   // Malta
        "flag_md": "🇲🇩",   // Moldova
        "flag_mc": "🇲🇨",   // Monaco
        "flag_me": "🇲🇪",   // Montenegro
        "flag_nl": "🇳🇱",   // Netherlands
        "flag_mk": "🇲🇰",   // North Macedonia
        "flag_no": "🇳🇴",   // Norway
        "flag_pl": "🇵🇱",   // Poland
        "flag_pt": "🇵🇹",   // Portugal
        "flag_ro": "🇷🇴",   // Romania
        "flag_ru": "🇷🇺",   // Russia
        "flag_sm": "🇸🇲",   // San Marino
        "flag_rs": "🇷🇸",   // Serbia
        "flag_sk": "🇸🇰",   // Slovakia
        "flag_si": "🇸🇮",   // Slovenia
        "flag_es": "🇪🇸",   // Spain
        "flag_se": "🇸🇪",   // Sweden
        "flag_ch": "🇨🇭",   // Switzerland
        "flag_tr": "🇹🇷",   // Turkey
        "flag_ua": "🇺🇦",   // Ukraine
        "flag_gb": "🇬🇧",   // United Kingdom
        "flag_va": "🇻🇦",   // Vatican City

        // European dependent territories with their own flags
        "flag_ax": "🇦🇽",   // Åland Islands
        "flag_fo": "🇫🇴",   // Faroe Islands
        "flag_gi": "🇬🇮",   // Gibraltar
        "flag_gg": "🇬🇬",   // Guernsey
        "flag_je": "🇯🇪",   // Jersey
        "flag_im": "🇮🇲",   // Isle of Man

        // Special European flags
        "flag_england": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        "flag_scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
        "flag_wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
        "flag_eu": "🇪🇺",

        // ------------------------------------------------------------------
        // North America
        // ------------------------------------------------------------------
        "flag_ag": "🇦🇬",   // Antigua and Barbuda
        "flag_bs": "🇧🇸",   // Bahamas
        "flag_bb": "🇧🇧",   // Barbados
        "flag_bz": "🇧🇿",   // Belize
        "flag_ca": "🇨🇦",   // Canada
        "flag_cr": "🇨🇷",   // Costa Rica
        "flag_cu": "🇨🇺",   // Cuba
        "flag_dm": "🇩🇲",   // Dominica
        "flag_do": "🇩🇴",   // Dominican Republic
        "flag_sv": "🇸🇻",   // El Salvador
        "flag_gd": "🇬🇩",   // Grenada
        "flag_gt": "🇬🇹",   // Guatemala
        "flag_ht": "🇭🇹",   // Haiti
        "flag_hn": "🇭🇳",   // Honduras
        "flag_jm": "🇯🇲",   // Jamaica
        "flag_mx": "🇲🇽",   // Mexico
        "flag_ni": "🇳🇮",   // Nicaragua
        "flag_pa": "🇵🇦",   // Panama
        "flag_kn": "🇰🇳",   // Saint Kitts and Nevis
        "flag_lc": "🇱🇨",   // Saint Lucia
        "flag_vc": "🇻🇨",   // Saint Vincent and the Grenadines
        "flag_tt": "🇹🇹",   // Trinidad and Tobago
        "flag_us": "🇺🇸",   // United States

        // North American dependent territories with their own flags
        "flag_ai": "🇦🇮",   // Anguilla
        "flag_aw": "🇦🇼",   // Aruba
        "flag_bm": "🇧🇲",   // Bermuda
        "flag_bq": "🇧🇶",   // Bonaire
        "flag_vg": "🇻🇬",   // British Virgin Islands
        "flag_ky": "🇰🇾",   // Cayman Islands
        "flag_cw": "🇨🇼",   // Curaçao
        "flag_gl": "🇬🇱",   // Greenland
        "flag_gp": "🇬🇵",   // Guadeloupe
        "flag_mq": "🇲🇶",   // Martinique
        "flag_ms": "🇲🇸",   // Montserrat
        "flag_pr": "🇵🇷",   // Puerto Rico
        "flag_bl": "🇧🇱",   // Saint Barthélemy
        "flag_mf": "🇲🇫",   // Saint Martin
        "flag_pm": "🇵🇲",   // Saint Pierre and Miquelon
        "flag_sx": "🇸🇽",   // Sint Maarten
        "flag_tc": "🇹🇨",   // Turks and Caicos Islands
        "flag_vi": "🇻🇮",   // U.S. Virgin Islands

        // ------------------------------------------------------------------
        // Oceania – Sovereign states
        // ------------------------------------------------------------------
        "flag_au": "🇦🇺",   // Australia
        "flag_fj": "🇫🇯",   // Fiji
        "flag_ki": "🇰🇮",   // Kiribati
        "flag_mh": "🇲🇭",   // Marshall Islands
        "flag_fm": "🇫🇲",   // Micronesia
        "flag_nr": "🇳🇷",   // Nauru
        "flag_nz": "🇳🇿",   // New Zealand
        "flag_pw": "🇵🇼",   // Palau
        "flag_pg": "🇵🇬",   // Papua New Guinea
        "flag_ws": "🇼🇸",   // Samoa
        "flag_sb": "🇸🇧",   // Solomon Islands
        "flag_to": "🇹🇴",   // Tonga
        "flag_tv": "🇹🇻",   // Tuvalu
        "flag_vu": "🇻🇺",   // Vanuatu

        // ------------------------------------------------------------------
        // Oceania – Dependent territories with their own flags
        // ------------------------------------------------------------------
        "flag_as": "🇦🇸",   // American Samoa (US)
        "flag_ck": "🇨🇰",   // Cook Islands (New Zealand)
        "flag_pf": "🇵🇫",   // French Polynesia (France)
        "flag_gu": "🇬🇺",   // Guam (US)
        "flag_nc": "🇳🇨",   // New Caledonia (France)
        "flag_nu": "🇳🇺",   // Niue (New Zealand)
        "flag_nf": "🇳🇫",   // Norfolk Island (Australia)
        "flag_mp": "🇲🇵",   // Northern Mariana Islands (US)
        "flag_pn": "🇵🇳",   // Pitcairn Islands (UK)
        "flag_tk": "🇹🇰",   // Tokelau (New Zealand)
        "flag_wf": "🇼🇫",   // Wallis and Futuna (France)

        // Australian Indian Ocean Territories (sometimes considered part of Oceania)
        "flag_cx": "🇨🇽",   // Christmas Island (Australia)
        "flag_cc": "🇨🇨",   // Cocos (Keeling) Islands (Australia)

        // ------------------------------------------------------------------
        // Additional territories occasionally included
        // ------------------------------------------------------------------
        "flag_hm": "🇭🇲",   // Heard Island and McDonald Islands (Australia) – uses Australian flag, but has its own ISO code
        "flag_um": "🇺🇲",   // United States Minor Outlying Islands (US) – uses US flag, but has ISO code
        // Note: For HM and UM, the flag emoji will render as the regional indicator symbols,
        // but they are not official flags and may not display as expected.

        // ------------------------------------------------------------------
        // South America
        // ------------------------------------------------------------------
        "flag_ar": "🇦🇷",   // Argentina
        "flag_bo": "🇧🇴",   // Bolivia
        "flag_br": "🇧🇷",   // Brazil
        "flag_cl": "🇨🇱",   // Chile
        "flag_co": "🇨🇴",   // Colombia
        "flag_ec": "🇪🇨",   // Ecuador
        "flag_gy": "🇬🇾",   // Guyana
        "flag_py": "🇵🇾",   // Paraguay
        "flag_pe": "🇵🇪",   // Peru
        "flag_sr": "🇸🇷",   // Suriname
        "flag_uy": "🇺🇾",   // Uruguay
        "flag_ve": "🇻🇪",   // Venezuela

        // South American dependent territories with their own flags
        "flag_fk": "🇫🇰",   // Falkland Islands
        "flag_gf": "🇬🇫",   // French Guiana
        "flag_gs": "🇬🇸"    // South Georgia and the South Sandwich Islands
    };

    // Sort keys alphabetically for consistency
    const sortedMap = {};
    Object.keys(emojiMap).sort().forEach(key => {
        sortedMap[key] = emojiMap[key];
    });

    // Build a single giant regex with all shortcodes
    // Escape special regex characters in shortcodes
    const shortcodes = Object.keys(sortedMap).map(code => 
        code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const emojiRegex = new RegExp(':(' + shortcodes.join('|') + '):', 'g');

    // Function to replace :shortcode: with Unicode emoji
    window.replaceEmojis = function(text) {
        return text.replace(emojiRegex, function(match, shortcode) {
            return sortedMap[shortcode] || match;
        });
    };
})();