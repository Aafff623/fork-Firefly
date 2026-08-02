/**
 * 日历节日表：公历固定节 + 近几年农历/节气节
 * 供侧栏日历悬停提示使用（格子本身不打徽章）
 */

export type HolidayEntry = {
	/** 展示名（中文站优先中文；英文站可走 nameEn） */
	name: string;
	nameEn?: string;
	/** cn = 国内/华语节；intl = 国际/西方节 */
	region: "cn" | "intl";
};

export type DayHolidays = {
	cn: string[];
	intl: string[];
};

/** 公历固定：每年同月同日 */
const SOLAR_FIXED: Record<string, HolidayEntry[]> = {
	"01-01": [
		{ name: "元旦", nameEn: "New Year's Day", region: "cn" },
		{ name: "新年", nameEn: "New Year's Day", region: "intl" },
	],
	"01-25": [{ name: "罗伯特·伯恩斯日", nameEn: "Burns Night", region: "intl" }],
	"02-14": [{ name: "情人节", nameEn: "Valentine's Day", region: "intl" }],
	"03-08": [
		{ name: "妇女节", nameEn: "Women's Day", region: "cn" },
		{ name: "国际妇女节", nameEn: "International Women's Day", region: "intl" },
	],
	"03-12": [{ name: "植树节", nameEn: "Arbor Day (CN)", region: "cn" }],
	"03-14": [{ name: "白色情人节", nameEn: "White Day", region: "intl" }],
	"03-17": [{ name: "圣帕特里克节", nameEn: "St. Patrick's Day", region: "intl" }],
	"04-01": [{ name: "愚人节", nameEn: "April Fools' Day", region: "intl" }],
	"04-22": [{ name: "世界地球日", nameEn: "Earth Day", region: "intl" }],
	"04-23": [{ name: "世界读书日", nameEn: "World Book Day", region: "intl" }],
	"05-01": [
		{ name: "劳动节", nameEn: "Labour Day", region: "cn" },
		{ name: "国际劳动节", nameEn: "International Workers' Day", region: "intl" },
	],
	"05-04": [{ name: "青年节", nameEn: "Youth Day (CN)", region: "cn" }],
	"05-12": [{ name: "护士节", nameEn: "International Nurses Day", region: "intl" }],
	"06-01": [
		{ name: "儿童节", nameEn: "Children's Day", region: "cn" },
		{ name: "国际儿童节", nameEn: "International Children's Day", region: "intl" },
	],
	"06-05": [{ name: "世界环境日", nameEn: "World Environment Day", region: "intl" }],
	"07-01": [
		{ name: "建党节", nameEn: "CPC Founding Day", region: "cn" },
		{ name: "加拿大国庆", nameEn: "Canada Day", region: "intl" },
	],
	"07-04": [{ name: "美国独立日", nameEn: "Independence Day (US)", region: "intl" }],
	"07-14": [{ name: "法国国庆", nameEn: "Bastille Day", region: "intl" }],
	"08-01": [{ name: "建军节", nameEn: "PLA Day", region: "cn" }],
	"08-15": [{ name: "日本终战日", nameEn: "V-J Day", region: "intl" }],
	"09-10": [{ name: "教师节", nameEn: "Teachers' Day (CN)", region: "cn" }],
	"09-21": [{ name: "国际和平日", nameEn: "International Day of Peace", region: "intl" }],
	"10-01": [
		{ name: "国庆节", nameEn: "National Day (CN)", region: "cn" },
		{ name: "国际音乐日", nameEn: "International Music Day", region: "intl" },
	],
	"10-24": [{ name: "联合国日", nameEn: "United Nations Day", region: "intl" }],
	"10-31": [{ name: "万圣节", nameEn: "Halloween", region: "intl" }],
	"11-01": [{ name: "诸圣节", nameEn: "All Saints' Day", region: "intl" }],
	"11-11": [
		{ name: "光棍节", nameEn: "Singles' Day", region: "cn" },
		{ name: "停战纪念日", nameEn: "Remembrance / Veterans Day", region: "intl" },
	],
	"12-24": [{ name: "平安夜", nameEn: "Christmas Eve", region: "intl" }],
	"12-25": [{ name: "圣诞节", nameEn: "Christmas Day", region: "intl" }],
	"12-26": [{ name: "节礼日", nameEn: "Boxing Day", region: "intl" }],
	"12-31": [{ name: "跨年夜", nameEn: "New Year's Eve", region: "intl" }],
};

/**
 * 母亲节：5 月第二个星期日
 * 父亲节：6 月第三个星期日
 * 感恩节（美）：11 月第四个星期四
 */
function nthWeekdayOfMonth(
	year: number,
	monthIndex: number,
	weekday: number,
	nth: number,
): string {
	const first = new Date(year, monthIndex, 1);
	const firstWd = first.getDay();
	let day = 1 + ((weekday - firstWd + 7) % 7) + (nth - 1) * 7;
	const mm = String(monthIndex + 1).padStart(2, "0");
	const dd = String(day).padStart(2, "0");
	return `${year}-${mm}-${dd}`;
}

/** 农历/节气类：按公历日期硬编码（覆盖近几年） */
const LUNAR_AND_SOLAR_TERM: Record<number, Record<string, HolidayEntry[]>> = {
	2025: {
		"01-28": [{ name: "除夕", nameEn: "Chinese New Year's Eve", region: "cn" }],
		"01-29": [{ name: "春节", nameEn: "Spring Festival", region: "cn" }],
		"02-12": [{ name: "元宵节", nameEn: "Lantern Festival", region: "cn" }],
		"04-04": [{ name: "清明节", nameEn: "Qingming Festival", region: "cn" }],
		"05-31": [{ name: "端午节", nameEn: "Dragon Boat Festival", region: "cn" }],
		"10-06": [{ name: "中秋节", nameEn: "Mid-Autumn Festival", region: "cn" }],
		"10-29": [{ name: "重阳节", nameEn: "Double Ninth Festival", region: "cn" }],
	},
	2026: {
		"02-16": [{ name: "除夕", nameEn: "Chinese New Year's Eve", region: "cn" }],
		"02-17": [{ name: "春节", nameEn: "Spring Festival", region: "cn" }],
		"03-03": [{ name: "元宵节", nameEn: "Lantern Festival", region: "cn" }],
		"04-05": [{ name: "清明节", nameEn: "Qingming Festival", region: "cn" }],
		"06-19": [{ name: "端午节", nameEn: "Dragon Boat Festival", region: "cn" }],
		"09-25": [{ name: "中秋节", nameEn: "Mid-Autumn Festival", region: "cn" }],
		"10-18": [{ name: "重阳节", nameEn: "Double Ninth Festival", region: "cn" }],
	},
	2027: {
		"02-05": [{ name: "除夕", nameEn: "Chinese New Year's Eve", region: "cn" }],
		"02-06": [{ name: "春节", nameEn: "Spring Festival", region: "cn" }],
		"02-20": [{ name: "元宵节", nameEn: "Lantern Festival", region: "cn" }],
		"04-05": [{ name: "清明节", nameEn: "Qingming Festival", region: "cn" }],
		"06-09": [{ name: "端午节", nameEn: "Dragon Boat Festival", region: "cn" }],
		"09-15": [{ name: "中秋节", nameEn: "Mid-Autumn Festival", region: "cn" }],
		"10-08": [{ name: "重阳节", nameEn: "Double Ninth Festival", region: "cn" }],
	},
	2028: {
		"01-25": [{ name: "除夕", nameEn: "Chinese New Year's Eve", region: "cn" }],
		"01-26": [{ name: "春节", nameEn: "Spring Festival", region: "cn" }],
		"02-09": [{ name: "元宵节", nameEn: "Lantern Festival", region: "cn" }],
		"04-04": [{ name: "清明节", nameEn: "Qingming Festival", region: "cn" }],
		"05-28": [{ name: "端午节", nameEn: "Dragon Boat Festival", region: "cn" }],
		"10-03": [{ name: "中秋节", nameEn: "Mid-Autumn Festival", region: "cn" }],
		"10-26": [{ name: "重阳节", nameEn: "Double Ninth Festival", region: "cn" }],
	},
	2029: {
		"02-12": [{ name: "除夕", nameEn: "Chinese New Year's Eve", region: "cn" }],
		"02-13": [{ name: "春节", nameEn: "Spring Festival", region: "cn" }],
		"02-27": [{ name: "元宵节", nameEn: "Lantern Festival", region: "cn" }],
		"04-04": [{ name: "清明节", nameEn: "Qingming Festival", region: "cn" }],
		"06-16": [{ name: "端午节", nameEn: "Dragon Boat Festival", region: "cn" }],
		"09-22": [{ name: "中秋节", nameEn: "Mid-Autumn Festival", region: "cn" }],
		"10-16": [{ name: "重阳节", nameEn: "Double Ninth Festival", region: "cn" }],
	},
	2030: {
		"02-02": [{ name: "除夕", nameEn: "Chinese New Year's Eve", region: "cn" }],
		"02-03": [{ name: "春节", nameEn: "Spring Festival", region: "cn" }],
		"02-17": [{ name: "元宵节", nameEn: "Lantern Festival", region: "cn" }],
		"04-05": [{ name: "清明节", nameEn: "Qingming Festival", region: "cn" }],
		"06-05": [{ name: "端午节", nameEn: "Dragon Boat Festival", region: "cn" }],
		"09-12": [{ name: "中秋节", nameEn: "Mid-Autumn Festival", region: "cn" }],
		"10-05": [{ name: "重阳节", nameEn: "Double Ninth Festival", region: "cn" }],
	},
};

function pushUnique(
	bucket: DayHolidays,
	entry: HolidayEntry,
	preferEn: boolean,
) {
	const label = preferEn ? entry.nameEn || entry.name : entry.name;
	const list = entry.region === "cn" ? bucket.cn : bucket.intl;
	if (!list.includes(label)) list.push(label);
}

function emptyDay(): DayHolidays {
	return { cn: [], intl: [] };
}

/** 合并某日全部节日（去重） */
export function getHolidaysForDate(
	year: number,
	month: number,
	day: number,
	preferEn = false,
): DayHolidays {
	const out = emptyDay();
	const mmdd = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	const ymd = `${year}-${mmdd}`;

	for (const entry of SOLAR_FIXED[mmdd] || []) {
		pushUnique(out, entry, preferEn);
	}

	const lunarYear = LUNAR_AND_SOLAR_TERM[year];
	if (lunarYear?.[ymd]) {
		for (const entry of lunarYear[ymd]) {
			pushUnique(out, entry, preferEn);
		}
	} else if (lunarYear?.[mmdd]) {
		// 兼容误写为 MM-DD 的键
		for (const entry of lunarYear[mmdd]) {
			pushUnique(out, entry, preferEn);
		}
	}

	return out;
}

/**
 * 预生成年份区间内「有节日」的日期表，供日历脚本 define:vars 注入
 * key = YYYY-MM-DD
 */
export function buildHolidayMap(
	fromYear: number,
	toYear: number,
	preferEn = false,
): Record<string, DayHolidays> {
	const map: Record<string, DayHolidays> = {};

	for (let year = fromYear; year <= toYear; year++) {
		// 固定公历
		for (const mmdd of Object.keys(SOLAR_FIXED)) {
			const [mm, dd] = mmdd.split("-").map(Number);
			const key = `${year}-${mmdd}`;
			const day = getHolidaysForDate(year, mm, dd, preferEn);
			if (day.cn.length || day.intl.length) map[key] = day;
		}

		// 浮动西方节
		const mothers = nthWeekdayOfMonth(year, 4, 0, 2); // May Sun #2
		const fathers = nthWeekdayOfMonth(year, 5, 0, 3); // Jun Sun #3
		const thanks = nthWeekdayOfMonth(year, 10, 4, 4); // Nov Thu #4

		const floaters: Record<string, HolidayEntry[]> = {
			[mothers]: [
				{ name: "母亲节", nameEn: "Mother's Day", region: "intl" },
			],
			[fathers]: [
				{ name: "父亲节", nameEn: "Father's Day", region: "intl" },
			],
			[thanks]: [
				{ name: "感恩节", nameEn: "Thanksgiving (US)", region: "intl" },
			],
		};

		for (const [key, entries] of Object.entries(floaters)) {
			const bucket = map[key] || emptyDay();
			for (const entry of entries) pushUnique(bucket, entry, preferEn);
			map[key] = bucket;
		}

		// 农历表（覆盖固定表同日合并）
		const lunar = LUNAR_AND_SOLAR_TERM[year];
		if (lunar) {
			for (const [keyOrMd, entries] of Object.entries(lunar)) {
				const key = keyOrMd.length === 5 ? `${year}-${keyOrMd}` : keyOrMd;
				const bucket = map[key] || emptyDay();
				for (const entry of entries) pushUnique(bucket, entry, preferEn);
				map[key] = bucket;
			}
		}
	}

	return map;
}
