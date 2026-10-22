import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import BookingList from "@/components/BookingList";
import { addBooking, removeBooking } from "@/redux/features/bookSlice";
import { makeStore } from "@/redux/store";

const booking = { nameLastname: "Guest Tester", tel: "0812345678", venue: "Bloom", bookDate: "2026/11/15" };

it("replaces only the same venue and date, and requires all four fields to cancel", () => {
  const store = makeStore();
  store.dispatch(addBooking(booking));
  const anotherDate = { ...booking, bookDate: "2026/11/16" };
  const anotherVenue = { ...booking, venue: "Spark" };
  store.dispatch(addBooking(anotherDate));
  store.dispatch(addBooking(anotherVenue));
  const replacement = { ...booking, nameLastname: "Updated Guest", tel: "0899999999" };
  store.dispatch(addBooking(replacement));
  expect(store.getState().bookSlice.bookItems).toEqual([replacement, anotherDate, anotherVenue]);
  store.dispatch(removeBooking(booking));
  expect(store.getState().bookSlice.bookItems).toHaveLength(3);
  store.dispatch(removeBooking(replacement));
  expect(store.getState().bookSlice.bookItems).toEqual([anotherDate, anotherVenue]);
});

it("shows booking details and returns to the empty state when cancelled", () => {
  const store = makeStore();
  store.dispatch(addBooking(booking));
  render(<Provider store={store}><BookingList /></Provider>);
  expect(screen.getByText(booking.nameLastname)).toBeInTheDocument();
  expect(screen.getByText(booking.tel)).toBeInTheDocument();
  expect(screen.getByText(booking.bookDate)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /cancel booking/i }));
  expect(screen.getByText("No Venue Booking")).toBeInTheDocument();
  expect(store.getState().bookSlice.bookItems).toEqual([]);
});
