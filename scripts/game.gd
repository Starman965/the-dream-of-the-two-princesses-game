extends Control

const BASE_SIZE := Vector2(1280, 720)

const STORY := [
	{
		"image": "res://assets/art/bedroom.png",
		"title": "The Magic Mirror",
		"body": "Emily wakes up and Audrey is gone. Something golden sparkles on the floor.",
		"task": "Tap the magic mirror.",
		"target": Rect2(536, 456, 190, 160),
		"done": "The mirror shimmers. WHOOSH! Emily is swept into a magical land."
	},
	{
		"image": "res://assets/art/meadow_castle.png",
		"title": "Friends on the Path",
		"body": "The bear, donkey, and rabbit tell Emily that Audrey is locked in the tower.",
		"task": "Tap the castle path to begin the rescue.",
		"target": Rect2(842, 170, 265, 240),
		"done": "Emily holds the mirror close and turns bravely toward the Great Forest."
	},
	{
		"image": "res://assets/art/forest_witch.png",
		"title": "The Golden Key",
		"body": "The witch is sleeping. The key to the dragons' cave is nearby.",
		"task": "Tap the golden key before the floorboard creaks.",
		"target": Rect2(552, 352, 220, 180),
		"done": "Emily grabs the key and runs back to her friends."
	},
	{
		"image": "res://assets/art/dragon_cave.png",
		"title": "Wake the Dragons",
		"body": "Jax and Lily sleep inside a cave filled with glowing crystals.",
		"task": "Tap the dragons to wake them.",
		"target": Rect2(332, 178, 610, 355),
		"done": "The dragons open their kind eyes. They are ready to fly to Audrey."
	},
	{
		"image": "res://assets/art/dragon_cave.png",
		"title": "Audrey Is Safe",
		"body": "Emily and Audrey fly into the stars with Jax and Lily. When morning comes, the sisters are back in bed.",
		"task": "Tap the mirror mark to play again.",
		"target": Rect2(550, 496, 180, 150),
		"done": "Maybe it was not a dream after all."
	}
]

var current_scene := 0
var solved := false
var sparkle_time := 0.0

var background := TextureRect.new()
var shade := ColorRect.new()
var title_label := Label.new()
var body_label := Label.new()
var task_label := Label.new()
var action_button := Button.new()
var target_button := Button.new()
var progress_label := Label.new()
var cutscene_layer := Control.new()
var cutscene_image := TextureRect.new()
var cutscene_caption := Label.new()
var cutscene_skip := Button.new()
var cutscene_active := false
var cutscene_time := 0.0
var cutscene_frame := -1
var cutscene_total_frames := 100
var cutscene_fps := 10.0

func _ready() -> void:
	_build_ui()
	_load_story_scene(0)

func _process(delta: float) -> void:
	if cutscene_active:
		_update_cutscene(delta)
		return
	sparkle_time += delta
	var alpha := 0.35 + sin(sparkle_time * 4.0) * 0.18
	target_button.self_modulate = Color(1.0, 0.9, 0.28, alpha)

func _build_ui() -> void:
	background.set_anchors_preset(Control.PRESET_FULL_RECT)
	background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	background.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	add_child(background)

	shade.set_anchors_preset(Control.PRESET_FULL_RECT)
	shade.color = Color(0.02, 0.03, 0.05, 0.20)
	add_child(shade)

	var story_panel := PanelContainer.new()
	story_panel.anchor_left = 0.035
	story_panel.anchor_top = 0.055
	story_panel.anchor_right = 0.49
	story_panel.anchor_bottom = 0.365
	story_panel.add_theme_stylebox_override("panel", _panel_style(Color(0.06, 0.07, 0.10, 0.78), Color(1.0, 0.85, 0.36, 0.65)))
	add_child(story_panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 22)
	margin.add_theme_constant_override("margin_top", 18)
	margin.add_theme_constant_override("margin_right", 22)
	margin.add_theme_constant_override("margin_bottom", 18)
	story_panel.add_child(margin)

	var text_stack := VBoxContainer.new()
	text_stack.add_theme_constant_override("separation", 8)
	margin.add_child(text_stack)

	title_label.add_theme_font_size_override("font_size", 32)
	title_label.add_theme_color_override("font_color", Color(1.0, 0.92, 0.62))
	title_label.text = ""
	text_stack.add_child(title_label)

	body_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	body_label.add_theme_font_size_override("font_size", 20)
	body_label.add_theme_color_override("font_color", Color(0.96, 0.96, 0.98))
	text_stack.add_child(body_label)

	task_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	task_label.add_theme_font_size_override("font_size", 19)
	task_label.add_theme_color_override("font_color", Color(0.68, 0.90, 1.0))
	text_stack.add_child(task_label)

	target_button.flat = true
	target_button.focus_mode = Control.FOCUS_NONE
	target_button.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	target_button.add_theme_stylebox_override("normal", _target_style())
	target_button.add_theme_stylebox_override("hover", _target_style())
	target_button.add_theme_stylebox_override("pressed", _target_style())
	target_button.pressed.connect(_on_target_pressed)
	add_child(target_button)

	progress_label.anchor_left = 0.035
	progress_label.anchor_top = 0.90
	progress_label.anchor_right = 0.35
	progress_label.anchor_bottom = 0.965
	progress_label.add_theme_font_size_override("font_size", 18)
	progress_label.add_theme_color_override("font_color", Color(1, 1, 1, 0.86))
	add_child(progress_label)

	action_button.anchor_left = 0.70
	action_button.anchor_top = 0.855
	action_button.anchor_right = 0.96
	action_button.anchor_bottom = 0.945
	action_button.add_theme_font_size_override("font_size", 22)
	action_button.add_theme_stylebox_override("normal", _button_style(Color(0.16, 0.48, 0.72)))
	action_button.add_theme_stylebox_override("hover", _button_style(Color(0.20, 0.58, 0.84)))
	action_button.add_theme_stylebox_override("pressed", _button_style(Color(0.10, 0.35, 0.56)))
	action_button.pressed.connect(_on_action_pressed)
	add_child(action_button)

	cutscene_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	cutscene_layer.visible = false
	add_child(cutscene_layer)

	cutscene_image.set_anchors_preset(Control.PRESET_FULL_RECT)
	cutscene_image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	cutscene_image.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	cutscene_layer.add_child(cutscene_image)

	var cutscene_shade := ColorRect.new()
	cutscene_shade.set_anchors_preset(Control.PRESET_FULL_RECT)
	cutscene_shade.color = Color(0, 0, 0, 0.10)
	cutscene_layer.add_child(cutscene_shade)

	cutscene_caption.anchor_left = 0.05
	cutscene_caption.anchor_top = 0.80
	cutscene_caption.anchor_right = 0.72
	cutscene_caption.anchor_bottom = 0.93
	cutscene_caption.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	cutscene_caption.text = "Emily flies with Jax toward the castle tower."
	cutscene_caption.add_theme_font_size_override("font_size", 30)
	cutscene_caption.add_theme_color_override("font_color", Color.WHITE)
	cutscene_caption.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.85))
	cutscene_caption.add_theme_constant_override("shadow_offset_x", 2)
	cutscene_caption.add_theme_constant_override("shadow_offset_y", 2)
	cutscene_layer.add_child(cutscene_caption)

	cutscene_skip.anchor_left = 0.76
	cutscene_skip.anchor_top = 0.84
	cutscene_skip.anchor_right = 0.95
	cutscene_skip.anchor_bottom = 0.93
	cutscene_skip.text = "Continue"
	cutscene_skip.add_theme_font_size_override("font_size", 22)
	cutscene_skip.add_theme_stylebox_override("normal", _button_style(Color(0.16, 0.48, 0.72)))
	cutscene_skip.add_theme_stylebox_override("hover", _button_style(Color(0.20, 0.58, 0.84)))
	cutscene_skip.add_theme_stylebox_override("pressed", _button_style(Color(0.10, 0.35, 0.56)))
	cutscene_skip.pressed.connect(_finish_cutscene)
	cutscene_layer.add_child(cutscene_skip)

func _load_story_scene(index: int) -> void:
	current_scene = index
	solved = false
	var scene: Dictionary = STORY[current_scene]
	background.texture = load(scene["image"])
	title_label.text = scene["title"]
	body_label.text = scene["body"]
	task_label.text = scene["task"]
	action_button.text = "Keep Going"
	action_button.disabled = true
	target_button.visible = true
	_place_target(scene["target"])
	progress_label.text = "Chapter %d of %d" % [current_scene + 1, STORY.size()]

func _place_target(rect: Rect2) -> void:
	var scale := _content_scale()
	var offset := (get_viewport_rect().size - BASE_SIZE * scale) * 0.5
	target_button.position = offset + rect.position * scale
	target_button.size = rect.size * scale

func _notification(what: int) -> void:
	if what == NOTIFICATION_RESIZED:
		_place_target(STORY[current_scene]["target"])

func _on_target_pressed() -> void:
	if solved:
		return
	solved = true
	var scene: Dictionary = STORY[current_scene]
	body_label.text = scene["done"]
	task_label.text = "Nice. Tap the button to continue."
	target_button.visible = false
	action_button.disabled = false
	if current_scene == STORY.size() - 1:
		action_button.text = "Play Again"

func _on_action_pressed() -> void:
	if current_scene == STORY.size() - 1:
		_load_story_scene(0)
	elif current_scene == 3:
		_start_cutscene()
	else:
		_load_story_scene(current_scene + 1)

func _start_cutscene() -> void:
	cutscene_active = true
	cutscene_time = 0.0
	cutscene_frame = -1
	background.visible = false
	shade.visible = false
	title_label.get_parent().get_parent().get_parent().visible = false
	target_button.visible = false
	progress_label.visible = false
	action_button.visible = false
	cutscene_layer.visible = true
	_update_cutscene_frame(0)

func _update_cutscene(delta: float) -> void:
	cutscene_time += delta
	var next_frame := int(cutscene_time * cutscene_fps)
	if next_frame >= cutscene_total_frames:
		_finish_cutscene()
		return
	_update_cutscene_frame(next_frame)

func _update_cutscene_frame(frame_index: int) -> void:
	if frame_index == cutscene_frame:
		return
	cutscene_frame = frame_index
	var frame_path := "res://assets/video/dragon_flight_frames/frame_%03d.jpg" % [frame_index + 1]
	cutscene_image.texture = load(frame_path)

func _finish_cutscene() -> void:
	if not cutscene_active:
		return
	cutscene_active = false
	cutscene_layer.visible = false
	background.visible = true
	shade.visible = true
	title_label.get_parent().get_parent().get_parent().visible = true
	progress_label.visible = true
	action_button.visible = true
	_load_story_scene(4)

func _content_scale() -> float:
	var viewport_size := get_viewport_rect().size
	return max(viewport_size.x / BASE_SIZE.x, viewport_size.y / BASE_SIZE.y)

func _panel_style(fill: Color, border: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = fill
	style.border_color = border
	style.set_border_width_all(2)
	style.set_corner_radius_all(8)
	return style

func _button_style(fill: Color) -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = fill
	style.border_color = Color(1, 1, 1, 0.18)
	style.set_border_width_all(1)
	style.set_corner_radius_all(8)
	return style

func _target_style() -> StyleBoxFlat:
	var style := StyleBoxFlat.new()
	style.bg_color = Color(1.0, 0.86, 0.22, 0.18)
	style.border_color = Color(1.0, 0.92, 0.42, 0.78)
	style.set_border_width_all(4)
	style.set_corner_radius_all(100)
	return style
