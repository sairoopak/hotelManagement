const LOGINATTEMPTS = 3;
const LIMITDAYS = 3;
const AGELIMIT = 18;

// hotel class which has all the required functinalities
class Hotel
{
    // minimum 1 character before and after @, minimum 2 character after .
    static FEmailPattern = /^[a-zA-Z]+[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;
    static FNumberPattern = /[0-9]{10}/;
    static FPincodePattern = /[0-9]{6}/;

    constructor()
    {
        let LThisPointer = this;

        LThisPointer.FRooms = [],
        LThisPointer.AddInitialRooms();
        LThisPointer.SortRooms();

        LThisPointer.FUsers = [],
        LThisPointer.FBookingReport = [],
        LThisPointer.FBookingDetails = [],
        LThisPointer.FProfitReport = [],
        LThisPointer.FUserType = "admin",
        LThisPointer.FAttemptsLeft = LOGINATTEMPTS
    }

    // add's the initial rooms.
    AddInitialRooms()
    {
        let LThisPointer = this;
        LThisPointer.FRooms.push(new Room(101, "AC", 1, 1000, 150));
        LThisPointer.FRooms.push(new Room(102, "NON-AC", 1, 600, 100));
        LThisPointer.FRooms.push(new Room(201, "AC", 2, 2000, 200));
        LThisPointer.FRooms.push(new Room(202, "NON-AC", 2, 600, 150));
    }

    // sorts based on floor number, for same floor sorts based on room number.
    SortRooms() 
    {
        let LThisPointer = this;

        LThisPointer.FRooms.sort((a, b) => {
            if (a.FFloorNo !== b.FFloorNo) 
            {
                return a.FFloorNo - b.FFloorNo;
            } 
            else 
            {
                return a.FRoomNo - b.FRoomNo;
            }
        });
    }

    /**
     * 
     * @returns null
     */
    AddRoom() 
    {
        let LThisPointer = this;

        if(!(LThisPointer.IsUserEligibleToAddOrDelete()))
        {
            return;
        }

        let LNewRoomDetails = LThisPointer.GetNewRoomDetails();

        if(!(LThisPointer.IsAllRoomDetailsPresent(LNewRoomDetails)))
        {
            return;
        }
 
        if((LThisPointer.IsRoomExists(LNewRoomDetails.roomNo)))
        {
            AlertPopUp("Entered room number already exists.");
            return;
        }

        if(!(LThisPointer.ConfirmationPopup(`Are you sure to add ${LNewRoomDetails.roomNo} room?`)))
        {
            return;
        }

        const NEWROOM = new Room(LNewRoomDetails.roomNo, LNewRoomDetails.type, LNewRoomDetails.floorNo, 
                                 LNewRoomDetails.rent, LNewRoomDetails.maintenanceCost);

        LThisPointer.FRooms.push(NEWROOM);
        LThisPointer.SortRooms();
        AlertPopUp(`${LNewRoomDetails.roomNo} added succesfully.`);
        LThisPointer.RefreshAfterAddOrDelete();
    }

    IsUserEligibleToAddOrDelete()
    {
        let LThisPointer = this;

        if(!(LThisPointer.FUserType == "admin"))
        {
            AlertPopUp("You are not eligible to perform this operation.");
            return false;
        }
        return true;
    }

    /**
     * 
     * @param {room number} p_intRoomNo 
     * @returns boolean
     */
    IsRoomExists(p_intRoomNo)
    {
        if(!(IsValidNumber(p_intRoomNo)))
        {
            return;
        }

        let LIsRoomExists = HOTEL.FRooms.some(room => room.FRoomNo == p_intRoomNo);

        if(LIsRoomExists) // if room exists returning true
        {
            return true;
        }
        return false;
    }

    // reset's the form and display all rooms
    RefreshAfterAddOrDelete()
    {
        let LThisPointer = this;
        LThisPointer.ClearAllSections();
        LThisPointer.SetDisplayStyle('tsidRoomAvailabilitySection', 'block');
        LThisPointer.SetActiveNavItem('tsidRoomAvailabilitySection');
        LThisPointer.ResetForm();
        LThisPointer.DisplayAllRooms();
    }

    // delete's room if exists.
    DeleteRoom()
    {
        let LThisPointer = this;

        if(!(LThisPointer.IsUserEligibleToAddOrDelete()))
        {
            return;
        }

        let LRoomNo = LThisPointer.GetValueByIdName("tsidDeleteRoomNumber");

        if(!(LRoomNo))
        {
            return;
        }

        LRoomNo = Number(LRoomNo);
        if(!(LThisPointer.IsRoomExists(LRoomNo)))
        {
            AlertPopUp("No room exists of that room number.");
            return;
        }

        if(!(LThisPointer.ConfirmationPopup(`Are you sure to delete the ${LRoomNo} room?`)))
        {
            return;
        }

        let LDeletedRoomIndex = LThisPointer.FRooms.findIndex(room => room.FRoomNo === LRoomNo);
        LThisPointer.FRooms.splice(LDeletedRoomIndex, 1);
        LThisPointer.SortRooms();

        AlertPopUp(`${LRoomNo} deleted successfully.`); 
        LThisPointer.RefreshAfterAddOrDelete();
    }

    /**
     * 
     * @param {user object} p_objUser 
     */
    AddUser(p_objUser) 
    {
        let LThisPointer = this;
        LThisPointer.FUsers.push(p_objUser);
    }

    /**
     * 
     * @param {booking report object} p_objBookingReport 
     */
    AddBookingReport(p_objBookingReport)
    {
        let LThisPointer = this;
        LThisPointer.FBookingReport.push(p_objBookingReport);
    }

    /**
     * 
     * @param {booking details object} p_objBookingDetails 
     */
    AddBookingDetails(p_objBookingDetails)
    {
        let LThisPointer = this;
        LThisPointer.FBookingDetails.push(p_objBookingDetails);
    }
    
    /**
     * 
     * @param {profit report object} p_objProfitReport 
     */
    AddProfitReport(p_objProfitReport)
    {
        let LThisPointer = this;
        LThisPointer.FProfitReport.push(p_objProfitReport);
    }

    // takes the details of the newly added rooms.
    GetNewRoomDetails()
    {
        let LThisPointer = this;
        let LRoomNumber = Number(LThisPointer.GetValueByIdName('tsidEnteredRoomNumber'));
        let LType = LThisPointer.GetValueByIdName('tsidEnteredRoomType');
        let LFloorNumber = Number(LThisPointer.GetValueByIdName('tsidEnteredFloorNumber'));
        let LRent = Number(LThisPointer.GetValueByIdName('tsidEnteredRent'));
        let LMaintenanceCost = Number(LThisPointer.GetValueByIdName('tsidEnteredMaintenanceCost'));

        return{
            roomNo: LRoomNumber,
            type: LType,
            floorNo: LFloorNumber,
            rent: LRent,
            maintenanceCost: LMaintenanceCost
        }
    }

    /**
     * 
     * @param {this pointer} p_objThis 
     */
    AllowNumberOnly(p_objThis)
    {
        p_objThis.value = p_objThis.value.replace(/[^0-9]/g, '');
    }

    /**
     * 
     * @param {room object} p_objNewRoom 
     * @returns boolean
     */
    IsAllRoomDetailsPresent(p_objNewRoom)
    {
        if(!(IsNotNullOrUndefined(p_objNewRoom)))
        {
            return false;
        }

        for(let item in p_objNewRoom)
        {
            console.log(typeof p_objNewRoom[item]);
            
            if(!p_objNewRoom[item])
            {
                AlertPopUp("Enter all the fields.");
                return false;
            }
        }
        return true;
    }

    /**
     * 
     * @param {user name} p_stringUserName 
     * @returns null
     */
    DisplayUserByUserName(p_stringUserName)
    {   
        if(!(IsNotEmpty(p_stringUserName)))
        {
            return;
        }

        let LThisPointer = this;

        if (p_stringUserName === "admin") 
        {
            LThisPointer.SetDisplayStyle("tsidAdminSection", "block");
            LThisPointer.SetUserType("admin");
        } 
        else if (p_stringUserName === "operator") 
        {
            LThisPointer.SetDisplayStyle("tsidOperatorSection", "block");
            LThisPointer.SetUserType("operator");
        }
        else if (p_stringUserName === "user")
        {
            LThisPointer.SetDisplayStyle("tsidUserSection", "block");
            LThisPointer.SetUserType("user");
        }
    }

    // return's the current login attempt left
    GetLoginAttempts()
    {
        let LThisPointer = this;
        return LThisPointer.FAttemptsLeft;
    }

    /**
     * 
     * @param {value to set login attempts} p_intNumber 
     * @returns null
     */
    SetLoginAttempts(p_intNumber)
    {
        let LThisPointer = this;
        if(!(IsValidNumber(p_intNumber)))
        {
            return;
        }
        LThisPointer.FAttemptsLeft = p_intNumber;
    }

    /**
     * 
     * @param {user type} p_stringUserType 
     */
    SetUserType(p_stringUserType)
    {
        let LThisPointer = this;
        LThisPointer.FUserType = p_stringUserType;
    }

    /**
     * 
     * @returns string
     */
    GetUserType()
    {
        let LThisPointer = this;
        return LThisPointer.FUserType;
    }

    // resets the login attempts to default
    ResetLoginAttempts()
    {
        let LThisPointer = this;
        LThisPointer.SetLoginAttempts(LOGINATTEMPTS);
    }

    // function to setup content at login time.
    LoginSetUp()
    {
        let LThisPointer = this;
        LThisPointer.ResetLoginAttempts();
        LThisPointer.SetDisplayStyle("tsidRoomAvailabilitySection", "block");
        LThisPointer.DisplayAllRooms();
        LThisPointer.SetActiveNavItem("tsidRoomAvailabilitySection");
    }

    /**
     * 
     * @param {Entered user name} p_stringEnteredUserName 
     * @param {Entered user password} p_stringEnteredPwd 
     * @returns boolean
     */
    isValidCredentials(p_stringEnteredUserName, p_stringEnteredPwd)
    {
        if(!(IsNotEmpty(p_stringEnteredUserName)) || !(IsNotEmpty(p_stringEnteredPwd)))
        {
            return;
        }

        let LThisPointer = this;
        let LUser = LThisPointer.FUsers.find(user => user.GetUserName === p_stringEnteredUserName);

        if( !(LUser) || !(LUser.GetPassword === p_stringEnteredPwd))
        {
            return false;
        }
        
        if(LUser.GetPassword === p_stringEnteredPwd)
        {
            LThisPointer.ResetLoginForm();
            LThisPointer.SetDisplayStyle("tsidLoginSection", "none");
            LThisPointer.DisplayUserByUserName(LUser.GetUserName);
            LThisPointer.LoginSetUp();
            return true;
        }
    }

    // function to reset the login page form
    ResetLoginForm()
    {
        let LThisPointer = this;

        if(!LThisPointer.SetValueByIdName('tsidUserName', '') || !LThisPointer.SetValueByIdName('tsidPwd', ''))
        {
            return;
        }

        let LLoginErr = LThisPointer.GetElementById("tsidLoginError");
        let LAttempsCount = LThisPointer.GetElementById("tsidAttemptCount");

        if(!LLoginErr || !LAttempsCount)
        {
            return;
        }

        LLoginErr.innerHTML = "";
        LAttempsCount.innerHTML = "";
        LThisPointer.ResetUserType();
    }

    // reset the user type
    ResetUserType()
    {
        let LThisPointer = this;
        LThisPointer.SetUserType("");
    }

    /**
     * 
     * @param {remainging attempts} p_intAttemptsLeft 
     */
    // function to display the error message for incorrect user name or password
    SetLoginErroMessage(p_intAttemptsLeft)
    {
        let LThisPointer = this;

        let LLoginErr = LThisPointer.GetElementById("tsidLoginError");
        let LAttempsCount = LThisPointer.GetElementById("tsidAttemptCount");

        if(!LLoginErr || !LAttempsCount)
        {
            return;
        }

        LLoginErr.innerHTML = "Invalid username or password";
        LAttempsCount.innerHTML = `${p_intAttemptsLeft} attempts left`;
    }

    // function to handle login page
    Login()
    {
        let LThisPointer = this;
        let LEnteredUserName = LThisPointer.GetValueByIdName("tsidUserName");
        let LEnteredPwd = LThisPointer.GetValueByIdName("tsidPwd");
        let LLoginAttemptsLeft = LThisPointer.GetLoginAttempts();

        if(!LEnteredUserName || !LEnteredPwd)
        {
            console.log(LEnteredUserName);
            console.log(LEnteredPwd);
            console.log("alert");
            return;
        }

        if(LLoginAttemptsLeft == 0)
        {
            LThisPointer.SetLoginErroMessage(LLoginAttemptsLeft);
            AlertPopUp(`No attempts left.`);
            return;
        }

        if(LEnteredUserName.length == 0 || LEnteredPwd.length == 0)
        {
            AlertPopUp("Enter all the fields.");
            return;
        }

        // user row if matches to the entered user name.
        if(!(LThisPointer.isValidCredentials(LEnteredUserName, LEnteredPwd)))
        {
            LLoginAttemptsLeft--;
            LThisPointer.SetLoginAttempts(LLoginAttemptsLeft);
            LThisPointer.SetLoginErroMessage(LLoginAttemptsLeft);
        }
    }

    // function to clear all the users
    ClearAllUsers()
    {
        let LThisPointer = this;
        LThisPointer.SetDisplayStyle("tsidAdminSection", "none");
        LThisPointer.SetDisplayStyle("tsidOperatorSection", "none");
        LThisPointer.SetDisplayStyle("tsidUserSection", "none");
    }

    // clears all the sections
    ClearAllSections()
    {
        let LThisPointer = this;
        LThisPointer.SetDisplayStyle("tsidAdminAddRoomSection", "none");
        LThisPointer.SetDisplayStyle("tsidAdminDeleteRoomSection", "none");
        LThisPointer.SetDisplayStyle("tsidRoomAvailabilitySection", "none");
        LThisPointer.SetDisplayStyle("tsidRoomBookingSection", "none");
        LThisPointer.SetDisplayStyle("tsidBookingDetailsSection", "none");
        LThisPointer.SetDisplayStyle("tsidBookingReportSection", "none");
        LThisPointer.SetDisplayStyle("tsidShowProfitSection", "none");
    }

    // confirmation logout
    CheckLogout()
    {
        let LThisPointer = this;

        if(!(LThisPointer.ConfirmationPopup("Are you sure to logout?")))
        {
            return;
        }
        else
        {
            LThisPointer.ShowLoginPage();
        }
    }

    // function to handle login page while logout
    ShowLoginPage()
    {
        let LThisPointer = this;
        LThisPointer.ResetBookingRoomFrom();
        LThisPointer.ClearAllUsers();
        LThisPointer.ClearAllSections();
        LThisPointer.SetDisplayStyle("tsidLoginSection", "block");
    }

    /**
     * 
     * @param {id name} p_objId 
     * @param {value of to set} p_value 
     * @returns null
     */
    SetValueByIdName(p_objId, p_value)
    {
        let LThisPointer = this;

        if(!(IsNotNullOrUndefined(p_objId)))
        {
            return false;
        }

        let LElement = LThisPointer.GetElementById(p_objId);

        if(!LElement)
        {
            AlertPopUp(`Cant set the value of id ${p_objId} to ${p_value}`);
            return false;
        }
        LElement.value = p_value;
        return true;
    }

    /**
     * 
     * @param {id name} p_objId 
     * @returns input value of the id
     */
    GetValueByIdName(p_objId)
    {
        if(!(IsNotEmpty(p_objId)))
        {
            return;
        }

        let LThisPointer = this;
        let LIdValue = LThisPointer.GetElementById(p_objId);

        if(!LIdValue)
        {
            return null;
        }
        return LIdValue.value.trim();
    }

    /**
     * 
     * @param {room number} p_intRoomNo 
     * @returns object of that room number
     */
    GetSelectedRoom(p_intRoomNo)
    {
        if(!(IsValidNumber(p_intRoomNo)))
        {
            return;
        }

        let LThisPointer = this;
        let LSelectedRoom = LThisPointer.FRooms.find(room => room.GetRoomNumber === p_intRoomNo);

        if(!(IsNotNullOrUndefined(LSelectedRoom)))
        {
            return;
        }
        else
        {
            return LSelectedRoom;
        }
    }

    /**
     * 
     * @param {id name} p_objId 
     * @returns null
     */
    SetNullIfNotValid(p_objId)
    {
        if(!(IsNotEmpty(p_objId)))
        {
            return;
        }
        else
        {
            let LThisPointer = this;
            LThisPointer.SetValueByIdName(p_objId, "");
        }
    }

    /**
     * 
     * @returns an object of customer details
     */
    GetCustomerDetails() 
    {
        let LThisPointer = this;
        let LFirstName = LThisPointer.GetValueByIdName("tsidFname");
        let LLastName = LThisPointer.GetValueByIdName("tsidLname");

        let LEmail = LThisPointer.GetValueByIdName("tsidUserEmail").toLowerCase();

        if(!(LThisPointer.IsValidEmail(LEmail)))
        {
            LThisPointer.SetNullIfNotValid("tsidUserEmail");
            LEmail = "";
        }

        let LPhoneNumber = LThisPointer.GetValueByIdName("tsidUserNumber");

        if(!(LThisPointer.IsValidPhoneNumber(LPhoneNumber)))
        {
            LThisPointer.SetNullIfNotValid("tsidUserNumber");
            LPhoneNumber = "";
        }

        let LPinCode = LThisPointer.GetValueByIdName("tsidUserPincode");

        if(!(LThisPointer.IsValidPincode(LPinCode)))
        {
            LThisPointer.SetNullIfNotValid("tsidUserPincode");
            LPinCode = "";
        }

        return {
            firstname: LFirstName,
            lastname: LLastName,
            fullName: `${LFirstName} ${LLastName}`,
            birthday: LThisPointer.GetValueByIdName("tsidBday"),
            gender: LThisPointer.GetValueByIdName("tsidGender"),
            phoneNumber: LPhoneNumber,
            email: LEmail,
            address: `  ${LThisPointer.GetValueByIdName("tsidUserAddress")} <br> 
                        ${LPinCode} <br> 
                        ${LThisPointer.GetValueByIdName("tsidUserCity")}`
        };
    }

    /**
     * 
     * @returns an object of booking details
     */
    GetBookingDetails() 
    {
        let LThisPointer = this;
        let LRoomNo = Number(LThisPointer.GetValueByIdName("tsidRoomChoice"));
        let LCheckIn = LThisPointer.GetValueByIdName("tsidEntryDate");
        let LCheckOut = LThisPointer.GetValueByIdName("tsidDepature");

        return {
            roomNo: LRoomNo,
            checkIn: LCheckIn,
            checkOut: LCheckOut
        };
    }

    /**
     * 
     * @param {room number} p_intRoomNo 
     * @param {checkIn date} p_dateCheckIn 
     * @param {checkOut date} p_dateCheckOut 
     * @returns an object of room details
     */
    GetRoomDetails(p_intRoomNo, p_dateCheckIn, p_dateCheckOut) 
    {
        let LThisPointer = this;
        let LSelectedRoom = LThisPointer.GetSelectedRoom(p_intRoomNo);

        return {
            rent: LSelectedRoom.GetRent,
            maintenanceCost: LSelectedRoom.GetMaintanenceCost,
            floorNo: LSelectedRoom.GetFloorNumber,
            days: (new Date(p_dateCheckOut) - new Date(p_dateCheckIn)) / (1000 * 3600 * 24)
        };
    }

    /**
     * 
     * @param {object of customer details} p_objCustomerDetails 
     * @param {object of booking details} p_objBookingDetails 
     * @returns boolean
     */
    IsAllFieldsPresent(p_objCustomerDetails, p_objBookingDetails)
    {
        if(!p_objCustomerDetails.firstname ||
            !p_objCustomerDetails.lastname ||
            !p_objCustomerDetails.birthday ||
            !p_objCustomerDetails.phoneNumber ||
            !p_objBookingDetails.checkIn ||
            !p_objBookingDetails.checkOut)
        {
            
            return false;
        }
        else
        {
            return true;
        }
    }

    /**
     * 
     * @param {object of booking details} p_objBookingDetails 
     * @returns boolean
     */
    IsRoomSelected(p_objBookingDetails)
    {
        if(!(IsNotEmpty(p_objBookingDetails)))
        {
            return;
        }

        if(!p_objBookingDetails.roomNo)
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    /**
     * 
     * @returns boolean 
     */
    // function to check if any rooms are available on particular checkIn and CheckOut
    IsRoomsPresent()
    {
        let LThisPointer = this;

        if((LThisPointer.FindAvailableRooms().length))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    // function to reset the checkIn and checkOut dates
    ResetDates()
    {
        let LThisPointer = this;

        LThisPointer.SetValueByIdName("tsidEntryDate", "");
        LThisPointer.SetValueByIdName("tsidDepature", "");
    }

    /**
     * 
     * @returns null
     */
    // function to book the room
    BookRoom()
    {
        let LThisPointer = this;

        let LCustomerDetails = LThisPointer.GetCustomerDetails();
        let LBookingDetails = LThisPointer.GetBookingDetails();

        if(!(LThisPointer.IsAllFieldsPresent(LCustomerDetails, LBookingDetails)))
        {
            AlertPopUp("Enter all the required fields.");
            return;
        }

        if(!(LThisPointer.IsRoomSelected(LBookingDetails)))
        {
            if((LThisPointer.IsRoomsPresent()))
            {
                AlertPopUp("Enter room number to continue.");
                return;
            }
            else
            {
                LThisPointer.ResetDates();
                AlertPopUp("No rooms available on selected dates.");
                return;
            }
        }

        let LRoomDetails = LThisPointer.GetRoomDetails(LBookingDetails.roomNo, LBookingDetails.checkIn, 
                                                        LBookingDetails.checkOut);
        let LTotalAmount = LRoomDetails.rent * LRoomDetails.days;

        if(!(LThisPointer.ConfirmationPopup(`Total amount: ${LTotalAmount}. Want to continue?`)))
        {
            return;
        }
        else
        {
            let LTotalMaintenanceCost = LRoomDetails.maintenanceCost * LRoomDetails.days;
            let LProfit = LThisPointer.GetProfit(LTotalAmount, LTotalMaintenanceCost);

            LThisPointer.AddReports(LCustomerDetails, LBookingDetails, LRoomDetails, LTotalAmount,
                                    LTotalMaintenanceCost, LProfit);

            LThisPointer.FinalizeBooking(LTotalAmount);
        }
    }

    /**
     * 
     * @param {date object} p_objDate 
     * @returns formated date string
     */
    FormatDate(p_objDate)
    {
        if(!(IsNotEmpty(p_objDate)))
        {
            return;
        }
        return p_objDate.toISOString().split('T')[0];
    }

    /**
     * 
     * @param {value of total amount} p_floatTotalAmount 
     * @param {value of total maintenanceCost} p_floatTotalMaintenanceCost 
     * @returns float - total profit value
     */
    GetProfit(p_floatTotalAmount, p_floatTotalMaintenanceCost)
    {
        if(!(IsAmountNotNegative(p_floatTotalAmount)) || !(IsAmountNotNegative(p_floatTotalMaintenanceCost)))
        {
            return;
        }
        return p_floatTotalAmount - p_floatTotalMaintenanceCost;
    }

    /**
     * 
     * @param {object of customer details} p_objCustomerDetails 
     * @param {object of booking details} p_objBookingDetails 
     * @param {object of room details} p_objRoomDetails 
     * @param {value of total amount} p_floatTotalAmount 
     * @param {value of total maintenanceCost} p_floatTotalMaintenanceCost 
     * @param {value of total profit} p_floatProfit 
     */

    // function to add the reports
    AddReports(p_objCustomerDetails, p_objBookingDetails, p_objRoomDetails, 
                p_floatTotalAmount, p_floatTotalMaintenanceCost, p_floatProfit)
    {
        let LThisPointer = this;

        LThisPointer.AddBookingDetails({
            FullName: p_objCustomerDetails.fullName,
            Birthday: p_objCustomerDetails.birthday,
            Gender: p_objCustomerDetails.gender,
            PhoneNumber: p_objCustomerDetails.phoneNumber,
            Email: p_objCustomerDetails.email,
            Address: p_objCustomerDetails.address,
            RoomNumber: p_objBookingDetails.roomNo,
            CheckInDate: LThisPointer.FormatDate(new Date(p_objBookingDetails.checkIn)),
            CheckOutDate: LThisPointer.FormatDate(new Date(p_objBookingDetails.checkOut))
        });

        LThisPointer.AddBookingReport({
            FullName: p_objCustomerDetails.fullName,
            RoomNumber: p_objBookingDetails.roomNo,
            CheckInDate: LThisPointer.FormatDate(new Date(p_objBookingDetails.checkIn)),
            CheckOutDate: LThisPointer.FormatDate(new Date(p_objBookingDetails.checkOut)),
            TotalAmount: p_floatTotalAmount
        });

        LThisPointer.AddProfitReport({
            FloorNumber: p_objRoomDetails.floorNo,
            RoomNumber: p_objBookingDetails.roomNo,
            TotalDays: p_objRoomDetails.days,
            TotalAmount: p_floatTotalAmount,
            TotalMaintenanceCost: p_floatTotalMaintenanceCost,
            Profit: p_floatProfit
        });
    }

    /**
     * 
     * @param {value of total amount} p_floatTotalAmount 
     */
    // function to perform the final operations of the booking.
    FinalizeBooking(p_floatTotalAmount)
    {
        let LThisPointer = this;

        AlertPopUp(`Room booked successfully! Total amount: ${p_floatTotalAmount}`);

        LThisPointer.ResetBookingRoomFrom();
        LThisPointer.DisplayAllRooms();
        LThisPointer.SetDisplayStyle("tsidRoomBookingSection", "none");
        LThisPointer.SetDisplayStyle("tsidBookingReportSection", "block");
        LThisPointer.SetActiveNavItem("tsidBookingReportSection");
        LThisPointer.RenderReport("tsidBRTableBody", "FBookingReport", "tsidBookingReportSection", "tsidBDTable");
    }

    /**
     * 
     * @param {value of the report name} p_stringReportName 
     * @returns array of that report name
     */
    GetObjByReportName(p_stringReportName)
    {
        if(!(IsNotEmpty(p_stringReportName)))
        {
            return;
        }
      
        let LDataToRender;
        let LThisPointer = this;

        switch (p_stringReportName) 
        {
            case 'FBookingReport':
                LDataToRender = LThisPointer.FBookingReport;
                break;
            case 'FBookingDetails':
                LDataToRender = LThisPointer.FBookingDetails;
                break;
            case 'FProfitReport':
                LDataToRender = LThisPointer.FProfitReport;
                break;
            default:
                AlertPopUp('Invalid report type.');
                return;
        }
        return LDataToRender;
    }

    /**
     * 
     * @param {id name} p_objId 
     */
    // function to color the active nav item
    SetActiveNavItem(p_objId)
    {
        let LNavItems = document.querySelectorAll('#tsidNavItems .tsclsNavItems');
        LNavItems.forEach(navItem => {
            navItem.classList.remove('tsclsActiveNavItem');
        });
    
        let LActiveNavItems = document.querySelectorAll(`#tsidNavItems .tsclsNavItems[data-target="${p_objId}"]`);
        if (LActiveNavItems) 
        {
            LActiveNavItems.forEach(activeNavItem => {
                activeNavItem.classList.add('tsclsActiveNavItem');
            });
        }
    }

    // function to set the report display if any report exists.
    SetReportDisplay()
    {
        let LThisPointer = this;
        LThisPointer.SetDisplayStyle('tsidBDPara', 'none');
        LThisPointer.SetDisplayStyle('tsidBRPara', 'none');
        LThisPointer.SetDisplayStyle('tsidPRPara', 'none');
        LThisPointer.SetDisplayStyle('tsidBDTable', 'table');
        LThisPointer.SetDisplayStyle('tsidBRTable', 'table');
        LThisPointer.SetDisplayStyle('tsidPRTable', 'table');
    }

    /**
     * 
     * @param {report name} p_stringReportName 
     * @returns boolean.
     */
    IsUserEligible(p_stringReportName)
    {
        let LThisPointer = this;
        let LUserType = LThisPointer.GetUserType();
        // let LUserType = Hotel.FUserType;

        switch (LUserType)
        {
            case 'admin':
                return true;
            case 'operator':
                return (p_stringReportName === 'FBookingReport' || p_stringReportName === 'FBookingDetails');
            case 'user':
                return (p_stringReportName === 'FBookingReport');
            default:
                return false;
        }
    }

    /**
     * 
     * @param {id name} p_objId 
     * @param {array of objects} p_arrayName 
     * @returns null
     */
    // function to render the report based on the id name and array of objects
    RenderReport(p_objId, p_arrayName, p_objSectionId, p_objTableId)
    {
        if(!(IsNotEmpty(p_objId)) || 
            !(IsNotEmpty(p_arrayName)) ||
            !(IsNotEmpty(p_objSectionId)) ||
            !(IsNotEmpty(p_objTableId)) )
        {
            return;
        }

        let LThisPointer = this;
        let LTableBody = LThisPointer.GetElementById(p_objId);

        if(!LTableBody)
        {
            return;
        }
        else
        {
            LTableBody.innerHTML = '';
    
            if(!LThisPointer.IsUserEligible(p_arrayName))
            {
                AlertPopUp("You do not have permission to view this report.");
                LThisPointer.SetDisplayStyle(p_objTableId, "none");
                return;
            }
    
            LThisPointer.SetDisplayStyle(p_objSectionId, 'block');
            let LDataToRender = LThisPointer.GetObjByReportName(p_arrayName);
    
            if(!IsNotEmpty(LDataToRender))
            {
                return;
            }
    
            LThisPointer.IsReportPresent(LDataToRender.length);
            for(let i =0; i < LDataToRender.length; i++)
            {
                let LBookingRecord = LDataToRender[i];
                let LRow = document.createElement("tr");
                LRow.innerHTML += `<td>${i + 1}</td>`
    
                for(let LBooking in LBookingRecord)
                {
                    LRow.innerHTML += `<td> ${LBookingRecord[LBooking]} </td>`;
                }
                LTableBody.appendChild(LRow);
            }
        }          
    }

    /**
     * 
     * @param {length of the report array} p_intReportLength 
     */
    IsReportPresent(p_intReportLength)
    {
        let LThisPointer = this;

        if(p_intReportLength > 0)
        {
            LThisPointer.SetReportDisplay();
        }
    }

    /**
     * 
     * @param {popup message} p_stringConfirmationPopup 
     * @returns boolean
     */
    ConfirmationPopup(p_stringConfirmationPopup)
    {
        return confirm(p_stringConfirmationPopup);
    }

    /**
     * 
     * @param {id name} p_objId 
     * @returns id object
     */
    GetElementById(p_objId)
    {
        if(!(IsNotEmpty(p_objId))) ///
        {
            return false;
        }

        try {
            let LElement = document.getElementById(p_objId);
            
            if(!LElement)
            {
                throw new Error(`Element with id '${p_objId}' is not present.`);
            }
            return LElement;
        } 
        catch (error) {
            AlertPopUp(error.message);
            return false;
        }
    }

    /**
     * 
     * @returns floor map of the available rooms
     */
    GetFloorMap() 
    {
        let LFloorMap = {};
        let LThisPointer = this;

        // Iterate over FRooms and group by floor number
        for (let room of LThisPointer.FRooms) 
        {
            let LFloorNo = room.GetFloorNumber;

            if (!LFloorMap[LFloorNo]) 
            {
                LFloorMap[LFloorNo] = [];
            }
            LFloorMap[LFloorNo].push(room.GetRoomNumber);
        }
        return LFloorMap;
    }
    
    // function to display all the rooms.
    DisplayAllRooms()
    {
        let LThisPointer = this;
        let LElementARDisplay = LThisPointer.GetElementById("tsidAvailableRoomsDisplay");

        if(!LElementARDisplay)
        {
            return;
        }
        else
        {
            LElementARDisplay.innerHTML = " ";
            let LFloorMap = LThisPointer.GetFloorMap();

            LThisPointer.HandleNoRoomsErrorMsg(LFloorMap);    

            for(let floorNumber in LFloorMap) 
            {
                let LRooms = LFloorMap[floorNumber];
                LElementARDisplay.innerHTML += `Floor No - ${floorNumber} <br>`;

                let LTrElement = document.createElement("tr");
                let LRoomCount =0;
            
                LRooms.forEach(room => {
                    if(LRoomCount == 8)
                    {
                        LElementARDisplay.appendChild(LTrElement);
                        LTrElement = document.createElement("tr");
                        LRoomCount = 0;
                    }

                    LTrElement.innerHTML +=  `<td> <li class="tsclsAvailable">${room}
                                                ${LThisPointer.GetSelectedRoom(room).FType}  
                                                </li> </td> `;
                    LRoomCount++;
                });
                LTrElement.innerHTML += `<br>`;
                LElementARDisplay.appendChild(LTrElement);
            }
        }
    }

    /**
     * 
     * @param {object} p_objFloorMap 
     */
    HandleNoRoomsErrorMsg(p_objFloorMap)
    {
        let LThisPointer = this;

        if(!Object.keys(p_objFloorMap).length)
        {
            LThisPointer.SetDisplayStyle("tsidNoRoomsErrorMsg", 'block');
            LThisPointer.SetDisplayStyle("tsidRAEntryDetails", "none");
        }
        else
        {
            LThisPointer.SetDisplayStyle("tsidNoRoomsErrorMsg", 'none');
            LThisPointer.SetDisplayStyle("tsidRAEntryDetails", "block");
        }
    }

    /**
     * 
     * @returns all the existed rooms
     */
    GetAllRooms()
    {
        let LThisPointer = this;
        let LAllRooms = [];

        LThisPointer.FRooms.forEach((room) => {
            LAllRooms.push(room.FRoomNo);
        })
        return LAllRooms;
    }

    /**
     * 
     * @param {id name} p_objIdRoomChoice 
     * @returns 
     */

    // function to give available room options
    GiveAvailableRoomOptions(p_objIdRoomChoice) 
    {
        let LThisPointer = this;
        let LElementRoomChoice = LThisPointer.GetElementById(p_objIdRoomChoice);

        if(!LElementRoomChoice)
        {
            return;
        }

        LElementRoomChoice.innerHTML = `<option value="" disabled selected>Available rooms</option>`;
        let LPresentAvailableRooms = LThisPointer.FindAvailableRooms();

        if(!LPresentAvailableRooms)
        {
            LElementRoomChoice.innerHTML = `<option value="" disabled selected>No rooms available</option>`;
            return;
        }
        
        for (let i = 0; i < LPresentAvailableRooms.length; i++) 
        {
            let LRoom = LThisPointer.FRooms.find(room => room.FRoomNo == LPresentAvailableRooms[i]);
            LElementRoomChoice.innerHTML += `<option value=${LRoom.GetRoomNumber}> ${LRoom.GetRoomNumber} 
            ${LRoom.GetType} - ${LRoom.GetRent} Rupees</option>`;
        }  
    }

    /**
     * 
     * @param {id name} p_objId 
     * @param {style to set} p_stringStyle 
     */
    // function to set the display style
    SetDisplayStyle(p_objId, p_stringStyle)
    {
        if(!(IsNotEmpty(p_objId)) || !(IsNotEmpty(p_stringStyle)))
        {
            return;
        }
        else
        {
            let LThisPointer = this;
            let LElement = LThisPointer.GetElementById(p_objId);

            if(!LElement)
            {
                return;
            }

            LElement.style.display = p_stringStyle;
        }
    }

    /**
     * 
     * @param {value of this} p_objThis 
     * @returns null
     */
    ValidateName(p_objThis)
    {
        if(!(IsNotEmpty(p_objThis)))
        {
            return;
        }
        p_objThis.value = p_objThis.value.replace(/[^a-zA-Z]/g, '');
    }

    /**
     * 
     * @param {[value of phone number]} p_intPhoneNumber 
     * @returns boolean
     */
    IsValidPhoneNumber(p_intPhoneNumber)
    {
        if(!(Hotel.FNumberPattern.test(p_intPhoneNumber)))
        {
            return false;
        }
        return true;
    }

    /**
     * 
     * @param {value of pincode} p_intPincode 
     * @returns boolean
     */
    IsValidPincode(p_intPincode)
    {
        if(!(Hotel.FPincodePattern.test(p_intPincode)))
        {
            return false;
        }
        return true;
    }

    /**
     * 
     * @param {email id} p_emailValue 
     * @returns boolean
     */
    IsValidEmail(p_emailValue)
    {
        if(!(Hotel.FEmailPattern.test(p_emailValue)))
        {
            return false;
        }
        return true;
    }   

    /**
     * 
     * @param {this} p_objThis 
     * @returns null
     */
    ValidateEmail(p_objThis)
    {
        if(!(IsNotEmpty(p_objThis)))
        {
            return;
        }

        let LThisPointer = this;

        if(!(LThisPointer.IsValidEmail(p_objThis.value)))
        {
            LThisPointer.SetDisplayStyle("tsidEmailErrorMessage", 'block');
        }
        else
        {
            LThisPointer.SetDisplayStyle("tsidEmailErrorMessage", "none");
        }
    }

    /**
     * 
     * @param {this} p_objThis 
     * @param {id} p_objId 
     * @param {function} p_callbackFunction 
     * @returns null
     */
    ValidateNumber(p_objThis, p_objId, p_callbackFunction) 
    {
        if(!(IsNotEmpty(p_objThis)) || 
            !(IsNotEmpty(p_objId)) || 
            !(IsNotEmpty(p_callbackFunction))) 
        {
            return;
        }
      
        let LThisPointer = this;

        if (!(p_callbackFunction(p_objThis.value))) 
        {
            LThisPointer.SetDisplayStyle(p_objId, "block");
        } 
        else 
        {
            LThisPointer.SetDisplayStyle(p_objId, "none");
        }
        p_objThis.value = p_objThis.value.replace(/[^0-9]/g, '');
    }
     
    /**
     * 
     * @param {this} p_objThis 
     * @param {id of pincode} p_objId 
     */
    ValidatePincode(p_objThis, p_objId) 
    {
        let LThisPointer = this;
        LThisPointer.ValidateNumber(p_objThis, p_objId, LThisPointer.IsValidPincode);
    }
      
    /**
     * 
     * @param {this} p_objThis 
     * @param {id of phone number} p_objId 
     */
    ValidatePhoneNumber(p_objThis, p_objId) 
    {
        let LThisPointer = this;
        LThisPointer.ValidateNumber(p_objThis, p_objId, LThisPointer.IsValidPhoneNumber);
    }   

    // function to set the age eligibility
    SetAgeEligibility() 
    {
        let LThisPointer = this;
        let LToday = new Date();
        let LAboveLimit = new Date(LToday.setFullYear(LToday.getFullYear() - AGELIMIT));
        let LElementBday = LThisPointer.GetElementById("tsidBday");

        if(!LElementBday)
        {
            return;
        }
        LElementBday.max = LAboveLimit.toISOString().split("T")[0];
    }

    /**
     * 
     * @param {value of this pointer} p_objThis 
     * @returns null
     */
    SetMinimumDate(p_objThis)
    {
        let LThisPointer = this;

        if(!(IsNotNullOrUndefined(p_objThis)))
        {
            return;
        }

        let LElement =  LThisPointer.GetElementById(p_objThis.id);

        if(!LElement)
        {
            return;
        }
        LElement.min = LThisPointer.FormatDate(new Date());  
    }

    /**
     * 
     * @returns array of available rooms for particular checkIn and checkOut 
     */
    FindAvailableRooms() 
    {
        let LThisPointer = this;
        let LInputCheckIn = LThisPointer.GetValueByIdName("tsidEntryDate");
        let LInputCheckOut = LThisPointer.GetValueByIdName("tsidDepature");

        if(!LInputCheckIn || !LInputCheckOut)
        {
            return;
        }

        let LAllRooms = LThisPointer.GetAllRooms();
    
        return LAllRooms.filter(room => 
        {
            return !LThisPointer.FBookingReport.some(booking => {
                if (booking.RoomNumber !== room) 
                {
                    return false; // Continue to next booking if room number does not match
                }
                return (LInputCheckIn < booking.CheckOutDate && LInputCheckOut > booking.CheckInDate);
            });
        });
    }

    // function to set the depature date.
    SetDepatureDate()
    {
        let LThisPointer = this;
        let LDepatureDate = LThisPointer.GetElementById("tsidDepature");

        if(!LDepatureDate)
        {
            return;
        }

        LDepatureDate.value = "";
        LDepatureDate.disabled = false;
    
        let LToday = LThisPointer.GetValueByIdName("tsidEntryDate");
        let LFormattedToday = new Date(LToday);
        let LInputDate = LFormattedToday.getDate();
        
        let LSetMinimumDate = LInputDate + 1; 
        let LMinDepatureDate = LFormattedToday.setDate(LSetMinimumDate);
            
        let LSetMaximumDate = LInputDate + LIMITDAYS; 
        let LMaxDepatureDate = LFormattedToday.setDate(LSetMaximumDate);
    
        let MINI = new Date(LMinDepatureDate).toISOString().split("T")[0];
        let MAXI = new Date(LMaxDepatureDate).toISOString().split("T")[0];
        LDepatureDate.min = MINI;
        LDepatureDate.max = MAXI;
    }

    /**
     * 
     * @param {value of room number} p_intRoomNo 
     * @param {vlaue of entry date} p_date 
     * @returns boolean
     */
    // function to check the room availability for entered date
    IsRoomAvailableOnEntryDate(p_intRoomNo, p_date) 
    {
        let LThisPointer = this;

        if(!(IsValidNumber(p_intRoomNo)) || !(IsNotNullOrUndefined(p_date)))
        {
            return;
        }
        else
        {
            for(let booking of LThisPointer.FBookingReport) 
            {
                if (booking.RoomNumber == p_intRoomNo &&
                        p_date >= booking.CheckInDate && 
                        p_date < booking.CheckOutDate) 
                {
                    return false;
                }
            }
            return true;
        }
    }

    // function to color the rooms based on the availability
    ColorBasedOnAvailability() 
    {
        let LThisPointer = this;
        let LEntryDate = LThisPointer.FormatDate(new Date(LThisPointer.GetValueByIdName("tsidRAEntryDate")));

        if (!(IsNotNullOrUndefined(LEntryDate))) 
        {
            return;
        }
        else
        {
            let LRoomElements = document.querySelectorAll('#tsidRAFloors li');

            LRoomElements.forEach(roomElement => {
                let LRoomNumber = parseInt(roomElement.textContent);
                if (LThisPointer.IsRoomAvailableOnEntryDate(LRoomNumber, LEntryDate)) 
                {
                    roomElement.className = 'tsclsAvailable';
                } 
                else 
                {
                    roomElement.className = 'tsclsBooked';
                }
            });
        }
    }

    ResetForm()
    {      
        let LInputFields = document.querySelectorAll('form input');
        LInputFields.forEach(input => input.value = "");

        let LSelectFields = document.querySelectorAll('form select');
        LSelectFields.forEach(select => select.selectedIndex = 0);
    }

    // function to reset the booking room from 
    ResetBookingRoomFrom() 
    {
        let LThisPointer = this;
        LThisPointer.ResetForm();
        LThisPointer.SetDisplayStyle("tsidEmailErrorMessage", "none");
        LThisPointer.SetDisplayStyle("tsidPincodeErrorMessage", "none");
        LThisPointer.SetDisplayStyle("tsidNumberErrorMessage", "none");

        let LGenderElement = LThisPointer.GetElementById("tsidGender");
        let LDepatureElement = LThisPointer.GetElementById("tsidDepature");
        let LRoomChoiceElement = LThisPointer.GetElementById("tsidRoomChoice");

        if(!LGenderElement || !LDepatureElement || !LRoomChoiceElement)
        {
            return;
        }

        LDepatureElement.disabled = true;
        LRoomChoiceElement.innerHTML = `<option value="" disabled selected>Available rooms</option>`;
    }
};

// room class
class Room
{
    constructor(p_intRoomNo, p_stringType, p_intFloorNo, p_floatRent, 
        p_floatMaintenanceCost)
    {
        let LThisPointer = this;
        LThisPointer.FRoomNo =  p_intRoomNo,
        LThisPointer.FFloorNo = p_intFloorNo,
        LThisPointer.FType = p_stringType,
        LThisPointer.FRent = p_floatRent,
        LThisPointer.FMaintanenceCost = p_floatMaintenanceCost
    }

    get GetRoomNumber()
    {
        let LThisPointer = this;
        return LThisPointer.FRoomNo;
    }

    set SetRoomNumber(p_intRoomNo)
    {
        let LThisPointer = this;

        if(!(IsValidNumber(p_intRoomNo)))
        {
            return;
        }
        LThisPointer.FRoomNo = p_intRoomNo;
    }

    get GetType()
    {
        let LThisPointer = this;
        return LThisPointer.FType;
    }

    set SetRoomType(p_stringType)
    {
        let LThisPointer = this;

        if(!(IsValidString(p_stringType)))
        {
            return;
        }
        LThisPointer.FType = p_stringType;
    }

    get GetFloorNumber()
    {
        let LThisPointer = this;
        return LThisPointer.FFloorNo;
    }

    set SetFloorNumber(p_intFloorNo)
    {
        let LThisPointer = this;

        if(!(IsValidNumber(p_intFloorNo)))
        {
            return;
        }
        LThisPointer.FFloorNo = p_intFloorNo;
    }

    get GetRent()
    {
        let LThisPointer = this;
        return LThisPointer.FRent;
    }

    set SetRent(p_floatRent)
    {
        let LThisPointer = this;

        if(!(IsValidAmount(p_floatRent)))
        {
            return;
        }
        LThisPointer.FRent = p_floatRent;
    }

    get GetMaintanenceCost()
    {   
        let LThisPointer = this;
        return LThisPointer.FMaintanenceCost;
    }
    
    set SetMaintanenceCost(p_floatMaintenanceCost)
    {
        let LThisPointer = this;

        if(!(IsValidAmount(p_floatMaintenanceCost)))
        {
            return;
        }
        LThisPointer.FMaintanenceCost = p_floatMaintenanceCost;
    }
};

// user class
class User
{
    #PvtUserPassword;
    constructor(p_stringType, p_stringUserName, p_stringUserPassword)
    {
        let LThisPointer = this;
        LThisPointer.FType = p_stringType,
        LThisPointer.FUserName = p_stringUserName,
        LThisPointer.#PvtUserPassword = p_stringUserPassword
    }

    get GetUserType()
    {
        let LThisPointer = this;
        return LThisPointer.FType;
    }

    get GetUserName()
    {
        let LThisPointer = this;
        return LThisPointer.FUserName;
    }

    get GetPassword()
    {
        let LThisPointer = this;
        return LThisPointer.#PvtUserPassword;
    }

    set SetUserType(p_stringType)
    {
        let LThisPointer = this;
        if(!(IsValidString(p_stringType)))
        {
            return;
        }
        LThisPointer.FType = p_stringType;
    }

    set SetUserName(p_stringUserName)
    {
        if(!(IsValidString(p_stringUserName)))
        {
            return;
        }
        this.FUserName = p_stringUserName;
    }

    set SetPassword(p_stringUserPassword)
    {
        let LThisPointer = this;
        if(!(IsValidString(p_stringUserPassword)))
        {
            return;
        }
        LThisPointer.#PvtUserPassword = p_stringUserPassword;
    }
}

function IsNotEmpty(p_variable)
{
    if(!(p_variable))
    {
        AlertPopUp("Something went wrong.");
        return false;
    }
    return true;
}

function IsValidNumber(p_number)
{
    if(typeof p_number !== "number")
    {
        AlertPopUp("Enter valid number.");
        return false;
    }
    return true;
}

function IsNumberPostive(p_floatNumber)
{
    if(!(IsValidNumber(p_floatNumber)))
    {
        return false;
    }

    if(p_floatNumber <= 0)
    {
        AlertPopUp("Number value cannot be zero.");
        return false;
    }
    else
    {
        return true;
    }
}

function IsAmountNotNegative(p_floatAmount)
{
    if(p_floatAmount < 0)
    {
        AlertPopUp("Amount cannot be negative.");
        return false;
    }
    return true;
}

function IsNotNullOrUndefined(p_variable)
{
    if(p_variable == null || p_variable == undefined)
    {
        AlertPopUp("Something went wrong.");
        return false;
    }
    return true;
}

function IsValidAmount(p_floatAmount)
{
    if(!IsValidNumber(p_floatAmount))
    {
        return false;
    }
    if(!IsAmountNotNegative(p_floatAmount))
    {
        return false;
    }
    return true;
}

function IsValidDate(p_dateObj)
{
    if(!(p_dateObj instanceof Date))
    {
        AlertPopUp("Enter valid date.");
        return false;
    }
    return true;
}

function IsValidString(p_stringName)
{
    if(!(p_stringName instanceof String))
    {
        AlertPopUp("Enter valid name.");
        return false;
    }
    return true;
}

// objects of user class
const ADMIN = new User("admin", "admin", "admin");
const OPERATOR = new User("operator", "operator", "jan2016");
const USER1 = new User("user", "user", "usr2016");

// object of hotel class
const HOTEL = new Hotel();

// adding user objects to the hotel users array
HOTEL.AddUser(ADMIN);
HOTEL.AddUser(OPERATOR);
HOTEL.AddUser(USER1);

/**
 * 
 * @param {alert message} p_stringMsg 
 */
function AlertPopUp(p_stringMsg)
{
    alert(p_stringMsg);
}

// call to event listener functions on content load
document.addEventListener("DOMContentLoaded", AddEventListeners);

// Function to handle 'Enter' key press and focus the next input
function FocusNextInput(p_event) 
{
    if (p_event.key === "Enter" && !p_event.shiftKey) 
    {
        p_event.preventDefault();

        let LForm = p_event.target.closest('form'); // Get the closest form of the target input or select element 

        let LInputs = Array.from(LForm.querySelectorAll("input, select"));
        let LIndex = LInputs.indexOf(p_event.target);

        if (LIndex > -1 && LIndex < LInputs.length - 1) 
        {
            LInputs[LIndex + 1].focus();
        }
    }
}

/**
 * 
 * @param {from id} LFormId 
 * @returns null
 */
// Function to add event listeners to input fields of a specific form
function AddFormEventListeners(LFormId) 
{
    let LForm = document.getElementById(LFormId);

    if(!(IsNotEmpty(LForm)))
    {
        return;
    }
    let LInputs = LForm.querySelectorAll("input, select");
    LInputs.forEach(input => {
        input.addEventListener("keydown", FocusNextInput);
    });
}

// Define a function to handle the common actions
function HandleLogin() 
{
    HOTEL.DisplayAllRooms();
    HOTEL.SetActiveNavItem("tsidRoomAvailabilitySection");
    HOTEL.Login('tsidSigninBtn');
}

// function to add all event listeners
function AddEventListeners()
{
    let LAllForms = document.querySelectorAll('form');

    LAllForms.forEach((LForm =>{
        AddFormEventListeners(LForm.id); // adding the input event listners for all the form of particular id's.
    }));

    AddNavItemsListeners();
    PreventFormSubmission();
    HandleSubmitBtn("tsidPwd", HandleLogin);

    // we are using 'bind' because in callback the 'this' pointer will be lost, 
    // using 'bind' we make the this points to 'HOTEL' Object.
    HandleSubmitBtn("tsidEnteredMaintenanceCost", HOTEL.AddRoom.bind(HOTEL));
    HandleSubmitBtn("tsidDeleteRoomNumber", HOTEL.DeleteRoom.bind(HOTEL));
}

function AddNavItemsListeners() 
{
    let LNavItems = document.querySelectorAll('#tsidNavItems .tsclsNavItems');

    LNavItems.forEach(item => {
        item.addEventListener('click', function() {
            let LTargetId = this.getAttribute('data-target');
            HOTEL.SetActiveNavItem(LTargetId);
            HOTEL.SetDisplayStyle(LTargetId, 'block');
        });
    });
}

/**
 * 
 * @param {Element id} p_elementId 
 * @param {callback Function} p_callbackFunction 
 * @returns null
 */
function HandleSubmitBtn(p_elementId, p_callbackFunction)
{
    let LElementId = document.getElementById(p_elementId);

    if(!IsNotEmpty(LElementId))
    {
        return;
    }
    LElementId.addEventListener("keydown", function(p_event){
        if(p_event.key == "Enter" && !p_event.shiftKey)
        {
            p_callbackFunction();
        }
    })
}

function PreventFormSubmission() 
{
    let LForms = document.querySelectorAll("form");

    LForms.forEach(LForm => {
        LForm.addEventListener('submit', function(event) {
            event.preventDefault();
        });
    });
}