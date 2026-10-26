/** 设置面板的简单布尔开关 facade：组件只认 id，键名 / 门控 / 写入都交给设置登记表。 */
import {
	BOOLEAN_SETTING_IDS,
	type BooleanSettingId,
	settings,
} from "@/lib/settings/registry";

export const SIMPLE_TOGGLE_IDS: readonly BooleanSettingId[] =
	BOOLEAN_SETTING_IDS;

export type SimpleToggleId = BooleanSettingId;

export function getSimpleToggleDefaults(): Record<SimpleToggleId, boolean> {
	return Object.fromEntries(
		SIMPLE_TOGGLE_IDS.map((id) => [id, settings.defaultOf(id) === true]),
	) as Record<SimpleToggleId, boolean>;
}

export function readSimpleToggle(id: SimpleToggleId): boolean {
	return settings.read(id) === true;
}

/** 返回 false 表示当前环境写不进去（无 localStorage / 存储异常），调用方据此回滚 UI。 */
export function writeSimpleToggle(id: SimpleToggleId, value: boolean): boolean {
	return settings.set(id, value);
}
