public with sharing class EmployeeIndex {
    @AuraEnabled(cacheable=true)
    public static List<Emp__c> getDataEmployees(){
        try {
            return [Select Id, Name__c, Email__c, BirthDay__c, Phone__c, Memo__c From Emp__c];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Emp__c> searchData(String name, String phone) {
        try {
            String SOQL = 'Select Id, Name__c, Email__c, BirthDay__c, Phone__c, Memo__c From Emp__c';
            SOQL += ' WHERE Id != null ';
            if(name != '') {
                String searchLikeName = '%' + name + '%';
                SOQL += ' AND Name__c LIKE :searchLikeName ';
            }
            if(phone != '') {
                String searchLikePhone = '%' + phone + '%';
                SOQL += ' AND Phone__c LIKE :searchLikePhone ';
            }
            return Database.query(SOQL);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Emp__c detailEmployee(Id RecordId) {
        try {
            return [Select Id, Name__c, Email__c, BirthDay__c, Phone__c, Memo__c From Emp__c
                WHERE Id = :RecordId
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Emp__c newEmployee(String Name, String Email, String Phone, Date Birthday, String Memo){
        try {
            Emp__c newItem = new Emp__c();
            newItem.Name__c = Name;
            newItem.Email__c = Email;
            newItem.Phone__c = Phone;
            newItem.BirthDay__c = BirthDay;
            newItem.Memo__c = Memo;
            insert newItem;
            return newItem;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Boolean deleteEmployee(Id recordId){
        try {
            Emp__c item = new Emp__c();
            item = [Select Id from Emp__c WHERE Id = :recordId];
            delete item;
            return true;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static Emp__c updateEmployee(Id recordId, String Name, String Email, String Phone, Date Birthday, String Memo){
        try {
            Emp__c item = new Emp__c();
            item = [Select Id, Name__c, Email__c, BirthDay__c, Memo__c, Phone__c from Emp__c WHERE Id = :recordId];
            item.Name__c = Name;
            item.Email__c = Email;
            item.Phone__c = Phone;
            item.BirthDay__c = BirthDay;
            item.Memo__c = Memo;
            update item;
            return item;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}