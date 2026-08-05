package com.provider.service.dto;

public class UserDto {
    private Long id;
    private java.time.LocalDateTime createdDate;
    private String name;
    private String email;
    private String role;
    private String serviceType;
    private String pincode;
    private String address;
    private String state;
    private String district;
    private String phoneNo;
    private String status;
    private String status1;
    private String token;

    // getters and setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public java.time.LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(java.time.LocalDateTime createdDate) { this.createdDate = createdDate; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getStatus1() { return status1; }
    public void setStatus1(String status1) { this.status1 = status1; }
}
