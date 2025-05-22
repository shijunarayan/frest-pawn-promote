"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Inventory retrieved successfully!",
            items: [], // placeholder for now
        }),
    };
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0SXRlbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnZXRJdGVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFTyxNQUFNLE9BQU8sR0FBMkIsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQzdELE9BQU87UUFDTCxVQUFVLEVBQUUsR0FBRztRQUNmLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ25CLE9BQU8sRUFBRSxtQ0FBbUM7WUFDNUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxzQkFBc0I7U0FDbEMsQ0FBQztLQUNILENBQUM7QUFDSixDQUFDLENBQUM7QUFSVyxRQUFBLE9BQU8sV0FRbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlIYW5kbGVyIH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXI6IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgbWVzc2FnZTogXCJJbnZlbnRvcnkgcmV0cmlldmVkIHN1Y2Nlc3NmdWxseSFcIixcbiAgICAgIGl0ZW1zOiBbXSwgLy8gcGxhY2Vob2xkZXIgZm9yIG5vd1xuICAgIH0pLFxuICB9O1xufTtcbiJdfQ==