const Months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export function mapStatsData(data) {
    return data
        .map((item) => ({
            ...item,
            rides: item.rides.length === 0 ? null : item.rides.length,
            totalDistance: item.rides.length === 0 ? null : item.totalDistance,
            month: Months[item.month - 1],
        }))
        .reverse();
}
