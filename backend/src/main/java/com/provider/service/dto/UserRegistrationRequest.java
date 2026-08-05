package com.provider.service.dto;

public class UserRegistrationRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String serviceType;
    private String pincode;
    private String address;
    private String state;
    private String district;
    private String phoneNo;

    // provider-specific service details
    private String serviceName;
    private String serviceDescription;
    private Double pricingPerHour;
    private String serviceStatus; // AVAILABLE or NOT_AVAILABLE
    
    private String otp;

    // getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getPhoneNo() { return phoneNo; }
    public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }
    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }
    public String getServiceDescription() { return serviceDescription; }
    public void setServiceDescription(String serviceDescription) { this.serviceDescription = serviceDescription; }
    public Double getPricingPerHour() { return pricingPerHour; }
    public void setPricingPerHour(Double pricingPerHour) { this.pricingPerHour = pricingPerHour; }
    public String getServiceStatus() { return serviceStatus; }
    public void setServiceStatus(String serviceStatus) { this.serviceStatus = serviceStatus; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
